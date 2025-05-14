import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deletePlaylist } from '$lib/db/playlist';

export const DELETE: RequestHandler = async ({ params }) => {
	const { id: playlistId } = params;

	try {
		await deletePlaylist(playlistId);

		return json({ message: 'Playlist deleted' });
	} catch (error) {
		console.error(error);
		return json({ message: 'Internal server error' }, { status: 500 });
	}
};
