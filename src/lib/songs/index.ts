import type { Song } from '$lib/types';
import { mkdirSync } from 'fs';
import { readdir, stat, writeFile } from 'fs/promises';
import { parseFile } from 'music-metadata';
import path from 'path';
import { searchForWorkspaceRoot } from 'vite';
import { addSong, getAllSongs as getAllSongsFomDatabase, getSongFileName } from '$lib/db/song';

const getSongPathWithoutPlaylist = (path: string) => path.replace(/songs\/[^/]+\//, 'songs/');

const listFilesInDir = async (dir: string) => {
	return (await readdir(path.join(__dirname, dir), { withFileTypes: true }))
		.filter((item) => !item.isDirectory())
		.map((item) => path.join(dir, item.name).replace(__dirname, ''));
};

const __dirname = searchForWorkspaceRoot(import.meta.dirname);
export const songsDirName = 'songs';
export const coverDirName = '.cover';
const songsDir = path.join(__dirname, songsDirName);
const coverDir = path.join(songsDir, coverDirName);

// Create the directories if it doesn't exist
mkdirSync(path.join(songsDir, '.incomplete'), { recursive: true });
mkdirSync(path.join(coverDir), { recursive: true });

function getSongId(path: string): string {
	return path.split('/').pop()?.split('.').shift() as string;
}

export async function getAllSongs() {
	const files = await listFilesInDir(songsDirName);
	const songs: Song[] = await Promise.all(
		files.map(async (path) => {
			return await getSongInfo(path);
		})
	);

	return songs.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
}

export async function getSongInfo(p: string): Promise<Song> {
	p = getSongPathWithoutPlaylist(p);
	const metadata = await parseFile(p);
	const stats = await stat(p);
	const id = getSongId(p);
	return {
		id,
		title: metadata.common.title,
		artist: {
			name: metadata.common.artist
		},
		duration: Math.floor(metadata.format.duration),
		album: {
			title: metadata.common.album
		},
		year: metadata.common.year,
		mediaType: p.split('/').pop()?.split('.').pop(),
		addedAt: new Date(stats.ctime),
		filePath: p.startsWith('/') ? p : '/' + p
	} as Song;
}

export async function getSongInfoFromId(id: string): Promise<Song> {
	const songs = await getAllSongs();
	const filename = getSongFileName(songs.filter((s) => s.id === id)[0]);
	const filePath = path.join(songsDirName, filename);
	return await getSongInfo(filePath);
}

export async function extractCoverFromSong(
	song: Song
): Promise<{ format: string; type: string; description: string; data: Uint8Array }> {
	const filePath = path.join(songsDir, getSongFileName(song));
	const metadata = await parseFile(filePath);
	return metadata.common.picture[0];
}

export async function refreshSongs() {
	const songsInFS = await getAllSongs();
	const databaseSongs = await getAllSongsFomDatabase();
	const databaseSongsIds = databaseSongs.map((s) => s.id);
	const newlyAddedSongsInFS = songsInFS.filter((s) => !databaseSongsIds.includes(s.id));

	for (const song of newlyAddedSongsInFS) {
		const coverImage = await extractCoverFromSong(song);
		const coverImageName = song.id + '.png';
		const coverImagePath = path.join(coverDir, coverImageName);
		writeFile(coverImagePath, coverImage.data);
		await addSong(song);
	}
}
