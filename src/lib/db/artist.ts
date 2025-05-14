import type { Artist } from '$lib/types';
import db from '.';
import { getAllSongs } from './song';

export async function getAllArtists(): Promise<Artist[]> {
	const query = 'SELECT * FROM artist';
	const artists = await db.query(query);

	return artists.rows as Artist[];
}

export async function createArtist(artist: Artist): Promise<number> {
	const exists = async () => {
		const query = 'SELECT * FROM artist WHERE name = $1';
		const result = await db.query(query, [artist.name]);
		return result.rows as Artist[];
	};

	const artistExists = await exists();
	if (artistExists.length > 0) {
		return (artistExists[0] as unknown as Artist).id;
	} else {
		const query = 'INSERT INTO artist (name) VALUES ($1) RETURNING id';
		const result = await db.query(query, [artist.name]);
		return result.rows[0].id;
	}
}

export async function getArtistSongs(artist: Artist): Promise<Artist['songs']> {
	const allSongs = await getAllSongs();
	return allSongs.filter((song) => song.artist.id === artist.id) as Artist['songs'];
}
