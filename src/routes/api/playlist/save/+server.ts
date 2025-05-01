import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { savePlaylist } from '$lib/db/playlist';

export const PUT: RequestHandler = async ({ request }) => {
	const { playlist } = await request.json();

	try {
		await savePlaylist(playlist);
		return json({ message: 'Playlist saved', success: true });
	} catch (e) {
		return json({ error: e instanceof Error ? e.message : e }, { status: 500 });
	}
};
