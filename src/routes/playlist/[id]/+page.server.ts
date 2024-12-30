import { error, fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { deletePlaylist } from '$lib/db/playlist';

export const load = (async ({ parent, params }) => {
	const playlistId = params.id;
	const { playlists, ...restProps } = await parent();
	const playlist = playlists.find((playlist) => playlist.id === playlistId);
	if (!playlist) {
		return error(404, 'Playlist not found');
	}

	return { ...restProps, id: playlist.id };
}) satisfies PageServerLoad;

export const actions: Actions = {
	deletePlaylist: async ({ params }) => {
		try {
			const playlistId = params.id;
			if(!playlistId) {
				return fail(400, { message: 'Invalid playlist ID' });
			}
			await deletePlaylist(playlistId);
		} catch (e) {
			return fail(500, { message: e instanceof Error ? e.message : e });
		}

		throw redirect(303, '/');
	}
};
