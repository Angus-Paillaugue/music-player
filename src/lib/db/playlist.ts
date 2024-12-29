import { getSongFromId } from '$lib/db/song';
import type { Playlist, Song } from '$lib/types';
import { generateRandomString } from '$lib/utils';
import db from '.';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';

async function getPlaylistSongs(id: number): Promise<Song[]> {
	const query = `SELECT songId FROM beInPlaylist WHERE playlistId = ? ORDER BY addedAt DESC;`;
	const [songsIds] = await db.execute<RowDataPacket[]>(query, [id]);

	const songs: Song[] = [];
	for(const row of songsIds) {
		const { songId } = row as { songId: Song['id'] };
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

export async function createPlaylist(title: Playlist['title'], id: Playlist['id'] | null = null) {
	const query = `INSERT INTO playlist (id, title) VALUES (?, ?)`;
	id ??= generateRandomString(34); // generate a playlist id (length for a playlist Id is 34)
	await db.execute<ResultSetHeader>(query, [id, title]);
	return id;
}

export async function addSongToPlaylist(songId: Song['id'], playlistId: Playlist['id']) {
	const query = `INSERT INTO beInPlaylist (songId, playlistId) VALUES (?, ?)`;
	await db.execute(query, [songId, playlistId]);
}

export async function removeSongFromPlaylist(songId: Song['id'], playlistId: Playlist['id']) {
	const query = `DELETE FROM beInPlaylist WHERE songId = ? AND playlistId = ?`;
	await db.execute(query, [songId, playlistId]);
}

export async function toggleSongFromPlaylist(song: Song, playlist: Playlist) {
	const isInPlaylist = playlist.songs.map((s) => s.id).includes(song.id);
	if (isInPlaylist) {
		await removeSongFromPlaylist(song.id, playlist.id);
	} else {
		await addSongToPlaylist(song.id, playlist.id);
	}

	return !isInPlaylist;
}

export async function savePlaylist(playlist: Playlist) {
	const query = `UPDATE playlist SET title = ? WHERE id = ?`;
	await db.execute(query, [playlist.title, playlist.id]);
}

export async function deletePlaylist(id: Playlist['id']) {
	const deleteSongsInPlaylistQuery = `DELETE FROM beInPlaylist WHERE playlistId = ?`;
	await db.execute(deleteSongsInPlaylistQuery, [id]);
	const deletePlaylistQuery = `DELETE FROM playlist WHERE id = ?`;
	await db.execute(deletePlaylistQuery, [id]);
}
