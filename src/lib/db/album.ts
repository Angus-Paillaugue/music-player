import type { Album } from '$lib/types';
import db from '.';
import { type ResultSetHeader, type RowDataPacket } from 'mysql2';
import { normalizeSongPaths } from './song';

export async function getAllAlbums(): Promise<Album[]> {
	const query = `
		SELECT a.*,
			JSON_ARRAYAGG(JSON_OBJECT('id', s.id, 'title', s.title, 'duration', s.duration, 'year', s.year, 'addedAt', s.addedAt, 'mediaType', s.mediaType)) AS songs
		FROM album a
		LEFT JOIN song s ON a.id = s.albumId
		GROUP BY a.id, a.title
		ORDER BY a.title;`;
	const [albums] = await db.execute<RowDataPacket[]>(query);
	return (albums as Album[]).map((a) => ({
		...a,
		songs: a.songs.map(normalizeSongPaths)
	}));
}

export async function createAlbum(album: Album): Promise<number> {
	const exists = async () => {
		const query = 'SELECT * FROM album WHERE title = ?';
		const [rows] = await db.execute<RowDataPacket[]>(query, [album.title]);

		return rows as Album[];
	};

	const albumExists = await exists();
	if (albumExists.length > 0) {
		return (albumExists[0] as unknown as Album).id;
	} else {
		const query = 'INSERT INTO album (title) VALUES (?)';
		const [rows] = await db.execute<ResultSetHeader>(query, [album.title]);
		return rows.insertId;
	}
}
