import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createPlaylist } from '$lib/db/playlist';

export const POST: RequestHandler = async ({ request }) => {
<<<<<<< HEAD:src/routes/api/createPlaylist/+server.ts
	const { name } = await request.json();
=======
	const { title } = await request.json();
>>>>>>> 143c8cb1d79d04e831b6fc8a4c16eb9bf80d3b4d:src/routes/api/playlist/create/+server.ts

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
