import type { Album } from '$lib/types';
import db from '.';
import { normalizeSongPaths } from './song';

export async function getAllAlbums(): Promise<Album[]> {
	const query = `
		SELECT a.*,
			JSON_AGG(
				JSON_BUILD_OBJECT(
					'id', s.id,
					'title', s.title,
					'duration', s.duration,
					'year', s.year,
					'addedAt', s."addedAt",
					'mediaType', s."mediaType"
				)
			) AS songs
		FROM album a
		LEFT JOIN song s ON a.id = s."albumId"
		GROUP BY a.id, a.title
		ORDER BY a.title;`;
	const albums = await db.query(query);
	return (albums.rows as Album[]).map((a) => ({
		...a,
		songs: a.songs.map(normalizeSongPaths)
	}));
}

export async function createAlbum(album: Album): Promise<number> {
	const exists = async () => {
		const query = 'SELECT * FROM album WHERE title = $1';
		const result = await db.query(query, [album.title]);

		return result.rows as Album[];
	};

	const albumExists = await exists();
	if (albumExists.length > 0) {
		return albumExists[0].id;
	} else {
		const query = 'INSERT INTO album (title) VALUES ($1) RETURNING id';
		const result = await db.query(query, [album.title]);
		return result.rows[0].id;
	}
}
