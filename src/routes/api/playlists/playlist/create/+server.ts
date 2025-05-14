import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createPlaylist } from '$lib/db/playlist';

export const POST: RequestHandler = async ({ request }) => {
	const { title } = await request.json();

	try {
		const playlistId = await createPlaylist(title);
		const playlist = {
			id: playlistId,
			title,
			songs: []
		};

		return json({ playlist });
	} catch (e) {
		return json({ error: e instanceof Error ? e.message : e }, { status: 500 });
	}
};
