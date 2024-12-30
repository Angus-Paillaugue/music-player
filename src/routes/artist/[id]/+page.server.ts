import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAllArtists, getArtistSongs } from '$lib/db/artist';

export const load = (async ({ params }) => {
	try {
		const artistId = Number(params.id);
		const artists = await getAllArtists();
		const artist = artists.find((artist) => artist.id === artistId);
		if (!artist) {
			return error(404, 'Artist not found');
		}

		const artistsSongs = await getArtistSongs(artist);
		artist.songs = artistsSongs;

		return { artist };
	} catch(e) {
		return error(500, e instanceof Error ? e.message : e as string);
	}
}) satisfies PageServerLoad;
