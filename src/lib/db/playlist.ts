import { getSongFromId } from '$lib/db/song';
import type { Playlist, Song } from '$lib/types';
import db from '.';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

async function getPlaylistSongs(id: number): Promise<Song[]> {
	const query = `SELECT songId FROM beInPlaylist WHERE playlistId = ? ORDER BY addedAt DESC;`;
	const [songsIds] = await db.execute<RowDataPacket[]>(query, [id]);

	const songs: Song[] = [];
	for(const row of songsIds) {
		const { songId } = row as { songId: string };
		const song = await getSongFromId(songId);
		songs.push(song);
	}
	return songs;
}

export async function getAllPlaylists() {
	const query = `SELECT id, title FROM playlist`;
	const [playlists] = await db.execute<RowDataPacket[]>(query);
	for (const playlist of playlists) {
		const playlistSongs = await getPlaylistSongs(playlist.id);
		playlist.songs = playlistSongs;
	}

	return playlists as Playlist[];
}

export async function createPlaylist(title: string) {
	const query = `INSERT INTO playlist (title) VALUES (?)`;
	const [res] = await db.execute<ResultSetHeader>(query, [title]);
	return res.insertId;
}

export async function addSongToPlaylist(song: Song, playlist: Playlist) {
	const query = `INSERT INTO beInPlaylist (songId, playlistId) VALUES (?, ?)`;
	await db.execute(query, [song.id, playlist.id]);
}

export async function removeSongFromPlaylist(song: Song, playlist: Playlist) {
	const query = `DELETE FROM beInPlaylist WHERE songId = ? AND playlistId = ?`;
	await db.execute(query, [song.id, playlist.id]);
}

export async function toggleSongFromPlaylist(song: Song, playlist: Playlist) {
	const isInPlaylist = playlist.songs.map(s => s.id).includes(song.id);
	if(isInPlaylist) {
		await removeSongFromPlaylist(song, playlist)
	}else {
		await addSongToPlaylist(song, playlist);
	}

	return !isInPlaylist;
}
