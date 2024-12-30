import type { Artist } from '$lib/types';
import db from '.';
import { type ResultSetHeader, type RowDataPacket } from 'mysql2';
import { getAllSongs } from './song';

export async function getAllArtists() {
	const query = 'SELECT * FROM artist';
	const [artists] = await db.execute<RowDataPacket[]>(query);

	return artists as Artist[];
}

export async function createArtist(artist: Artist): Promise<number> {
	const exists = async () => {
		const query = 'SELECT * FROM artist WHERE name = ?';
		const [rows] = await db.execute<RowDataPacket[]>(query, [artist.name]);
		return rows as Artist[];
	};

	const artistExists = await exists();
	if (artistExists.length > 0) {
		return (artistExists[0] as unknown as Artist).id;
	} else {
		const query = 'INSERT INTO artist (name) VALUES (?)';
		const [rows] = await db.execute<ResultSetHeader>(query, [artist.name]);
		return rows.insertId;
	}
}

export async function getArtistSongs(artist: Artist) {
	const allSongs = await getAllSongs();
	return allSongs.filter((song) => song.artist.id === artist.id);
}
