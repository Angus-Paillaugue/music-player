import { coverDirName, songsDirName } from '$lib/songs';
import type { Song } from '$lib/types';
import path from 'path';
import db from '.';
import { type ResultSetHeader, type RowDataPacket } from 'mysql2';
import { createArtist } from './artist';
import { createAlbum } from './album';

export function getSongFileName(song: Song) {
	return song.id + '.' + song.mediaType;
}

export function normalizeSongPaths(song: Song): Song {
	song.filePath = '/' + path.join(songsDirName, getSongFileName(song));
	song.coverPath = '/' + path.join(songsDirName, coverDirName, song.id + '.png');
	return song;
}

export async function getSong(song: Song) {
	return await getSongFromId(song.id);
}

export async function getSongFromId(id: string) {
	const query = `
		SELECT
			s.id,
			s.title,
			s.duration,
			s.year,
			s.addedAt,
			s.mediaType,
			JSON_OBJECT('id', a.id, 'name', a.name) AS artist,
			JSON_OBJECT('id', al.id, 'title', al.title) AS album
		FROM song s
		JOIN artist a ON s.artistId = a.id
		JOIN album al ON s.albumId = al.id
		WHERE s.id = ?;`;
	const [rows] = await db.execute<RowDataPacket[]>(query, [id]);

	return normalizeSongPaths(rows[0] as Song);
}

export async function getAllSongs() {
	const query = `
		SELECT
			s.id,
			s.title,
			s.duration,
			s.year,
			s.addedAt,
			s.mediaType,
			JSON_OBJECT('id', a.id, 'name', a.name) AS artist,
			JSON_OBJECT('id', al.id, 'title', al.title) AS album
		FROM song s
		JOIN artist a ON s.artistId = a.id
		JOIN album al ON s.albumId = al.id
		ORDER BY s.addedAt DESC;`;
	const [songs] = await db.execute<RowDataPacket[]>(query);
	return (songs as Song[]).map(normalizeSongPaths);
}

export async function addSong(song: Song) {
	let albumId: null | number = null;
	if (song.album) {
		albumId = await createAlbum(song.album);
	}
	const artistId = await createArtist(song.artist);

	const query =
		'INSERT INTO song (id, title, duration, year, mediaType, artistId, albumId) VALUES (?, ?, ?, ?, ?, ?, ?)';
	await db.execute<ResultSetHeader>(query, [
		song.id,
		song.title,
		song.duration,
		song.year,
		song.mediaType,
		artistId,
		albumId
	]);
}
