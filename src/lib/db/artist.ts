import type { Artist } from '$lib/types';
import db from '.';
import { type ResultSetHeader, type RowDataPacket } from 'mysql2';

export async function getAllArtists() {
	const query = 'SELECT * FROM artist';
	const [artists] = await db.execute<RowDataPacket[]>(query);

	return artists as Artist[];
}

export async function createArtist(artist: Artist): Promise<number> {
	const query = 'INSERT INTO artist (name) VALUES (?)';
	const [rows] = await db.execute<ResultSetHeader>(query, [artist.name]);
	return rows.insertId;
}
