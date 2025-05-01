import type { Playlist, Song } from '$lib/types';
import { mkdirSync } from 'fs';
import { symlink, unlink, mkdir, readdir, stat } from 'fs/promises';
import { parseFile } from 'music-metadata';
import path from 'path';
import { searchForWorkspaceRoot } from 'vite';

const getSongPathWithoutPlaylist = (path: string) => path.replace(/songs\/[^/]+\//, 'songs/');

const listFilesInDir = async (dir: string) => {
	return (await readdir(path.join(__dirname, dir), { withFileTypes: true }))
		.filter((item) => !item.isDirectory())
		.map((item) => path.join(dir, item.name).replace(__dirname, ''));
};

const listDirsInDir = async (dir: string) => {
	return (await readdir(path.join(__dirname, dir), { withFileTypes: true }))
		.filter((item) => item.isDirectory())
		.filter((item) => item.name !== '.incomplete')
		.map((item) => path.join(dir, item.name).replace(__dirname, ''));
};

const __dirname = searchForWorkspaceRoot(import.meta.dirname);
const songsDirName = 'songs';
const songsDir = path.join(__dirname, songsDirName);

// Create the songs directory if it doesn't exist
mkdirSync(path.join(songsDir, '.incomplete'), { recursive: true });

function getSongId(path: string) {
	return path.split('/').pop()?.split('.').shift();
}

export async function getAllSongs() {
	const files = await listFilesInDir(songsDirName);
	const songs: Song[] = await Promise.all(
		files.map(async (path) => {
			const song = await getSongInfo(path);
			return song;
		})
	);

	return songs.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime()); // Sort by addedAt in descending order
}

export async function getSongInfo(path: string): Promise<Song> {
	path = getSongPathWithoutPlaylist(path);
	const metadata = await parseFile(path);
	const stats = await stat(path);
	return {
		id: getSongId(path),
		path: '/' + path,
		title: metadata.common.title,
		artist: metadata.common.artist,
		duration: Math.floor(metadata.format.duration),
		album: metadata.common.album,
		year: metadata.common.year,
		cover: metadata.common.picture[0],
		filename: path.split('/').pop(),
		addedAt: new Date(stats.ctime)
	} as Song;
}

export async function getSongPath(songId: string) {
	return (await listFilesInDir(songsDirName)).find((path) => getSongId(path) === songId);
}

export async function getPlaylists(): Promise<Playlist[]> {
	const playlistsPaths = await listDirsInDir(songsDirName);

	const playlists: Playlist[] = [];
	for (const playlistsPath of playlistsPaths) {
		const playlistName = playlistsPath.split('/').pop() as string;
		const songs = await listFilesInDir(playlistsPath);
		const playlistSongs = await Promise.all(
			songs.map(async (song) => {
				const songInfo = await getSongInfo(song);
				return songInfo;
			})
		);
		playlists.push({ name: playlistName, songs: playlistSongs });
	}

	return playlists;
}

export async function addSongToPlaylist(song: Song, playlistName: string) {
	const songPath = path.join(songsDir, song.filename);
	const newSongPath = path.join(songsDir, playlistName, song.filename);
	await symlink(songPath, newSongPath);
}

export async function removeSongFromPlaylist(song: Song, playlistName: string) {
	const songPath = path.join(songsDir, playlistName, song.filename);
	await unlink(songPath);
}

export async function createPlaylist(playlistName: string) {
	const playlistDir = path.join(songsDir, playlistName);
	await mkdir(playlistDir);
}

export async function deletePlaylist(playlistName: string) {
	const playlistDir = path.join(songsDir, playlistName);
	await unlink(playlistDir);
}

export async function toggleSongFromPlaylist(song: Song, playlistName: string) {
	const isInPlaylist = (await listFilesInDir(path.join(songsDirName, playlistName))).some(
		(path) => getSongId(path) === song.id
	);
	if (isInPlaylist) {
		await removeSongFromPlaylist(song, playlistName);
	} else {
		await addSongToPlaylist(song, playlistName);
	}

	return !isInPlaylist;
}
