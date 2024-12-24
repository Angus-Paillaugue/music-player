import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { refreshSongs } from '$lib/songs';
import { getAllSongs } from '$lib/db/song';

export const POST: RequestHandler = async () => {
	await refreshSongs();

	try {
		const songs = await getAllSongs();
		return json({ songs, success: true, message: 'Song refreshed successfully.' });
	} catch (error) {
		return json({ success: false, message: error instanceof Error ? error.message : error });
	}
};
