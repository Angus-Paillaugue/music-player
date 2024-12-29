import type { RequestHandler } from './$types';
import { spawn } from 'child_process';
import path, { join } from 'path';
import {
	saveSongCover,
	getSongInfoFromId,
	incompleteDirName,
	coverDirName,
	songsDirName,
	getSongIdFromFilename
} from '$lib/songs';
import { addSong, getAllSongs } from '$lib/db/song';
import type { Song } from '$lib/types';
import { addSongToPlaylist, createPlaylist, getAllPlaylists } from '$lib/db/playlist';
import { readdir, rename, unlink } from 'fs/promises';
import { json } from '@sveltejs/kit';
import { getAllAlbums } from '$lib/db/album';

const incompleteDir = path.join(songsDirName, incompleteDirName);

const getPlaylistNameFromSTDOUT = (stdout: string) => {
	const lines = stdout.split('\n');
	const match = '[download] Downloading playlist: ';
	const line = lines.find((line) => line.includes(match));
	return line ? line.split(match)[1].trim() : '';
};

const getCurrentlyDownloadingSongIndex = (stdout: string): { current: number; total: number } => {
	const lines = stdout.split('\n');
	const match = '[download] Downloading item ';
	const line = lines.findLast((line) => line.includes(match));
	if (!line) {
		return { current: -1, total: -1 };
	}
	const val = line.split(match)[1].split(' of ');
	return { current: Number(val[0].trim()), total: Number(val[1].trim()) };
};

const cleanup = async () => {
	const files = await readdir(incompleteDir);
	for (const file of files) {
		await unlink(join(incompleteDir, file));
	}
};

export const GET: RequestHandler = async ({ url }) => {
	const playlistId = url.searchParams.get('playlistId');
	const format = url.searchParams.get('format') as Song['mediaType'];

	if (!playlistId) {
		return new Response('Playlist ID is required.', { status: 400 });
	}

	let playlistName = '';
	let streamClosed = false;
	let currentSongIndex = 0;
	let totalSongs = 0;

	const command = [
		'yt-dlp',
		'-x',
		`--audio-format=${format}`,
		'--audio-quality=320k',
		'--write-thumbnail',
		'--embed-thumbnail',
		'--convert-thumbnails=png',
		'--embed-metadata',
		`-o${incompleteDir}/%(id)s.%(ext)s`,
		`https://www.youtube.com/playlist?list=${playlistId}`
	];

	try {
		const c = spawn(command[0], command.slice(1));

		const stream = new ReadableStream({
			start(controller) {
				// Handle child process stdout
				c.stdout.on('data', (data) => {
					if (streamClosed) return;
					const stdout = data.toString();

					if (!playlistName) {
						const name = getPlaylistNameFromSTDOUT(stdout);
						if (name) {
							playlistName = name;
							controller.enqueue(JSON.stringify({ event: 'playlistName', data: playlistName }));
						}
					}

					const songIndex = getCurrentlyDownloadingSongIndex(stdout);
					if (songIndex.current > -1) {
						currentSongIndex = songIndex.current;
						totalSongs = songIndex.total;
						controller.enqueue(JSON.stringify({ event: 'songIndex', data: songIndex }));
					}
				});

				// Handle child process exit
				c.on('exit', async () => {
					if (streamClosed) return;
					if (currentSongIndex < totalSongs) {
						controller.enqueue(JSON.stringify({ event: 'error', data: 'Download cancelled.' }));
						controller.close();
						await cleanup();
						return;
					}
					try {
						await createPlaylist(playlistName || playlistId, playlistId);
					} catch (error) {
						console.error('Error creating playlist.', error);
						controller.error(
							JSON.stringify({
								event: 'error',
								data: 'Error creating playlist.'
							})
						);
					}

					const files = await readdir(incompleteDir);

					for (const file of files) {
						const filePath = join(incompleteDir, file);
						if (file.endsWith(`.${format}`)) {
							try {
								await rename(filePath, join(songsDirName, file));
								const song = await getSongInfoFromId(getSongIdFromFilename(file));
								const songCoverPath = await saveSongCover(song.id);
								song.coverPath = songCoverPath;
								await addSong(song);
								await addSongToPlaylist(song.id, playlistId);
							} catch (_e) {
								controller.enqueue(
									JSON.stringify({
										event: 'error',
										data: "Couldn't add song to database."
									})
								);
							}
						} else if (file.endsWith('.png')) {
							// Move cover image to cover directory
							try {
								await rename(filePath, join(songsDirName, coverDirName, file));
							} catch (_e) {
								controller.enqueue(
									JSON.stringify({
										event: 'error',
										data: "Couldn't move cover image."
									})
								);
							}
						} else {
							// Is an artifact file, delete it
							await unlink(filePath);
						}
					}
					const playlists = await getAllPlaylists();
					const songs = await getAllSongs();
					const albums = await getAllAlbums();
					controller.enqueue(JSON.stringify({ event: 'end', data: { playlists, songs, albums} }));
					controller.close();
					streamClosed = true;
				});
			},
			async cancel() {
				streamClosed = true;
				c.kill();
				await cleanup();
			}
		});

		return new Response(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive'
			}
		});
	} catch (error) {
		console.error(error);
		return json({ event: 'error', data: 'An error occurred.' }, { status: 500 });
	}
};
