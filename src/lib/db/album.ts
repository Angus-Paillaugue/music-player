import type { Album } from '$lib/types';
import db from '.';
import { type ResultSetHeader, type RowDataPacket } from 'mysql2';
import { normalizeSongPaths } from './song';

export async function getAlbums() {
	const query = 'SELECT * FROM album';
	const [albums] = await db.execute<RowDataPacket[]>(query);

	return albums as Album[];
}

export async function getAllAlbums(): Promise<Album[]> {
	const query = `
		SELECT a.*,
       JSON_ARRAYAGG(JSON_OBJECT('id', s.id, 'title', s.title, 'duration', s.duration, 'year', s.year, 'addedAt', s.addedAt, 'mediaType', s.mediaType)) AS songs
		FROM album a
		LEFT JOIN song s ON a.id = s.albumId
		GROUP BY a.id, a.title;`;
	const [albums] = await db.execute<RowDataPacket[]>(query);
	return (albums as Album[]).map((a) => ({
		...a,
		songs: a.songs.map(normalizeSongPaths)
	}));
}

export async function createAlbum(album: Album): Promise<number> {
	const query = 'INSERT INTO album (title) VALUES (?)';
	const [rows] = await db.execute<ResultSetHeader>(query, [album.title]);
	return rows.insertId;
}
