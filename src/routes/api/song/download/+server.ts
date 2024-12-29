import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from 'child_process';
import fs from 'fs';
import { join } from 'path';
import { saveSongCover, getSongInfoFromId, refreshSongs, incompleteDirName } from '$lib/songs';
import { addSong } from '$lib/db/song';
import type { Song } from '$lib/types';

const completeDir = './songs';
const incompleteDir = join(completeDir, incompleteDirName);

async function downloadSong(songId: string, format: Song['mediaType']) {

	const command = `yt-dlp -x --audio-format ${format} --audio-quality 320k \
      --write-thumbnail --embed-thumbnail --convert-thumbnails png --embed-metadata --no-playlist \
      -o "${incompleteDir}/%(id)s.%(ext)s" \
      "https://www.youtube.com/watch?v=${songId}"`;

	return new Promise<void>((resolve, reject) => {
		exec(command, async (error) => {
			if (error) {
				// Delete any incomplete file
				const files = fs.readdirSync(incompleteDir);
				files.forEach((file) => {
					if (file.includes(songId)) {
						fs.unlinkSync(join(incompleteDir, file));
					}
				});

				return reject(error);
			}

			// Move file to the complete directory
			const files = fs.readdirSync(incompleteDir);
			files.forEach((file) => {
				const oldPath = join(incompleteDir, file);
				const newPath = join(completeDir, file);
				fs.renameSync(oldPath, newPath);
			});

			resolve();
		});
	});
}

export const POST: RequestHandler = async ({ request }) => {
	const { songId, format } = await request.json();
	if (!songId) {
		throw new Error('Song ID is required.');
	}

	try {
		const songExists = await getSongInfoFromId(songId);
		return json(
			{ message: 'Song already exists.', song: songExists },
			{ status: 400 }
		);
	} catch (_e) {}

	try {
		await downloadSong(songId, format);
		const songCoverPath = await saveSongCover(songId);
		const song = await getSongInfoFromId(songId);
		song.coverPath = songCoverPath;
		await addSong(song);
		await refreshSongs();
		return json({ song, success: true, message: 'Song downloaded successfully.' });
	} catch (error) {
		console.error(error);
		return json(
			{ message: error instanceof Error ? error.message : error },
			{ status: 500 }
		);
	}
};
