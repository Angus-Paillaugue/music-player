import { coverDirName, editMetadata, songsDirName } from '$lib/songs';
import type { Song } from '$lib/types';
import path from 'path';
import pool from '.';
import { createArtist } from './artist';
import { createAlbum } from './album';
import { unlink } from 'fs/promises';

export function getSongFileName(song: Song): string {
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

export async function getSongFromId(id: Song['id']): Promise<Song> {
	const query = `
		SELECT
			s.id,
			s.title,
			s.duration,
			s.year,
			s."addedAt",
			s."mediaType",
			json_build_object('id', a.id, 'name', a.name) AS artist,
			json_build_object('id', al.id, 'title', al.title) AS album
		FROM song s
		JOIN artist a ON s."artistId" = a.id
		LEFT OUTER JOIN album al ON s."albumId" = al.id
		WHERE s.id = $1;`;
	const result = await pool.query(query, [id]);
	if(result.rowCount === 0) {
		throw new Error(`Song with id ${id} not found`);
	}

	return normalizeSongPaths(result.rows[0] as Song);
}

export async function getAllSongs(): Promise<Song[]> {
	const query = `
		SELECT
			s.id,
			s.title,
			s.duration,
			s.year,
			s."addedAt",
			s."mediaType",
			json_build_object('id', a.id, 'name', a.name) AS artist,
			json_build_object('id', al.id, 'title', al.title) AS album
		FROM song s
		JOIN artist a ON s."artistId" = a.id
		LEFT OUTER JOIN album al ON s."albumId" = al.id
		ORDER BY s."addedAt" DESC;`;
	const songs = await pool.query(query);
	return (songs.rows as Song[]).map(normalizeSongPaths);
}

export async function addSong(song: Song): Promise<Song> {
	try {
		let albumId: null | number = null;
		if (song.album?.title) {
			albumId = await createAlbum(song.album);
			if(!albumId) {
				throw new Error('Album creation failed');
			}
		}
		const artistId = await createArtist(song.artist);

		console.log(song);
		const query =
			'INSERT INTO song (id, title, duration, year, "mediaType", "artistId", "albumId") VALUES ($1, $2, $3, $4, $5, $6, $7);';
		await pool.query(query, [
			song.id,
			song.title,
			song.duration,
			song.year,
			song.mediaType,
			artistId,
			albumId
		]);

		return song;
	} catch (error) {
		console.error('Error adding song:', error);
		throw error;
	}
}

export async function deleteSong(song: Song): Promise<void> {
	const query = 'DELETE FROM song WHERE id = $1';
	await pool.query(query, [song.id]);
	await unlink(path.join(songsDirName, getSongFileName(song)));
	await unlink(path.join(songsDirName, coverDirName, song.id + '.png'));
}

export async function updateSong(song: Song): Promise<void> {
	const query = `
		UPDATE song
		SET title = $1, duration = $2, year = $3, "mediaType" = $4
		WHERE id = $5;`;
	await pool.query(query, [song.title, song.duration, song.year, song.mediaType, song.id]);

	// TODO: make this work
	await editMetadata(song);
}
