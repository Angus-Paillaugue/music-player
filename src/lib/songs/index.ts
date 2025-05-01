import type { Song } from '$lib/types';
import { readdir, rename, stat } from 'fs/promises';
import { parseFile } from 'music-metadata';
import path from 'path';
import { searchForWorkspaceRoot } from 'vite';
import { addSong, getAllSongs as getAllSongsFomDatabase, getSongFileName } from '$lib/db/song';
// import nodeId3 from 'node-id3';

const listFilesInDir = async (dir: string) => {
	return (await readdir(path.join(__dirname, dir), { withFileTypes: true }))
		.filter((item) => !item.isDirectory())
		.map((item) => path.join(dir, item.name).replace(__dirname, ''));
};

const __dirname = searchForWorkspaceRoot(import.meta.dirname);
export const songsDirName = 'songs';
export const coverDirName = '.cover';
export const incompleteDirName = '.incomplete';
export const songsDir = path.join(__dirname, songsDirName);
export const coverDir = path.join(songsDir, coverDirName);
export const incompleteDir = path.join(songsDir, incompleteDirName);

export function getSongIdFromFilename(path: string): string {
	return path.split('/').pop()?.split('.').shift() as string;
}

async function getAllSongs() {
	const files = await listFilesInDir(songsDirName);
	const songs: Song[] = await Promise.all(
		files.map(async (path) => {
			return await getSongInfo(path);
		})
	);

	return songs.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
}

async function getSongInfo(p: string): Promise<Song> {
	const metadata = await parseFile(p);
	const stats = await stat(p);
	const id = getSongIdFromFilename(p);
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
	const files = await listFilesInDir(songsDirName);
	const song = files.find((f) => getSongIdFromFilename(f) === id);
	if (!song) {
		throw new Error('Song not found');
	}
	return await getSongInfo(song);
}

export async function saveSongCover(songId: string): Promise<string> {
	const coverImageName = songId + '.png';
	const coverImagePath = path.join(songsDir, coverImageName);
	const newCoverImagePath = path.join(coverDir, coverImageName);
	try {
		await rename(coverImagePath, newCoverImagePath);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
	} catch (_e) {}

	return '/' + path.join(songsDirName, coverDirName, coverImageName);
}

export async function refreshSongs() {
	const songsInFS = await getAllSongs();
	const databaseSongs = await getAllSongsFomDatabase();
	const databaseSongsIds = databaseSongs.map((s) => s.id);
	const newlyAddedSongsInFS = songsInFS.filter((s) => !databaseSongsIds.includes(s.id));

	for (const song of newlyAddedSongsInFS) {
		try {
			await saveSongCover(song.id);
			await addSong(song);
			// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
		} catch (_e) {}
	}
}

export async function editMetadata(song: Song) {
	// TODO: Fix this
	// await nodeId3.update(
	// 	{
	// 		title: song.title,
	// 	},
	// 	path.join(songsDir, getSongFileName(song))
	// );
}
