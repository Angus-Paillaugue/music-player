import { getSongFromId } from '$lib/db/song';
import type { Playlist, Song } from '$lib/types';
import { generateRandomString } from '$lib/utils';
import db from '.';

async function getPlaylistSongs(id: number): Promise<Song[]> {
	const query = `SELECT ps."songId" FROM playlist_song ps WHERE "playlistId" = $1 ORDER BY "addedAt" DESC;`;
	const songsIds = await db.query(query, [id]);

	const songs: Song[] = [];
	for (const row of songsIds.rows) {
		try {
			const { songId } = row as { songId: Song['id'] };
			const song = await getSongFromId(songId);
			songs.push(song);
		} catch (e) {
			console.error(`Error getting song with id ${row.songId}: ${e}`);
		}
	}
	return songs;
}

export async function getAllPlaylists(): Promise<Playlist[]> {
	const query = `SELECT id, title FROM playlist`;
	const playlists = await db.query(query);
	for (const playlist of playlists.rows) {
		const playlistSongs = await getPlaylistSongs(playlist.id);
		playlist.songs = playlistSongs;
	}

	return playlists.rows as Playlist[];
}

export async function createPlaylist(
	title: Playlist['title'],
	id: Playlist['id'] | null = null
): Promise<Playlist['id']> {
	const query = `INSERT INTO playlist (id, title) VALUES ($1, $2)`;
	id ??= generateRandomString(34); // generate a playlist id (length for a playlist Id is 34)
	await db.query(query, [id, title]);
	return id;
}

export async function addSongToPlaylist(
	songId: Song['id'],
	playlistId: Playlist['id']
): Promise<void> {
	const query = `INSERT INTO playlist_song ("songId", "playlistId") VALUES ($1, $2)`;
	await db.query(query, [songId, playlistId]);
}

export async function removeSongFromPlaylist(
	songId: Song['id'],
	playlistId: Playlist['id']
): Promise<void> {
	const query = `DELETE FROM playlist_song WHERE "songId" = $1 AND "playlistId" = $2`;
	await db.query(query, [songId, playlistId]);
}

export async function toggleSongFromPlaylist(song: Song, playlist: Playlist): Promise<boolean> {
	const isInPlaylist = playlist.songs.map((s) => s.id).includes(song.id);
	if (isInPlaylist) {
		await removeSongFromPlaylist(song.id, playlist.id);
	} else {
		await addSongToPlaylist(song.id, playlist.id);
	}

	return !isInPlaylist;
}

export async function savePlaylist(playlist: Playlist): Promise<void> {
	const query = `UPDATE playlist SET title = $1 WHERE id = $2`;
	await db.query(query, [playlist.title, playlist.id]);
}

export async function deletePlaylist(id: Playlist['id']): Promise<void> {
	const deleteSongsInPlaylistQuery = `DELETE FROM playlist_song WHERE "playlistId" = $1`;
	await db.query(deleteSongsInPlaylistQuery, [id]);
	const deletePlaylistQuery = `DELETE FROM playlist WHERE id = $1`;
	await db.query(deletePlaylistQuery, [id]);
}
