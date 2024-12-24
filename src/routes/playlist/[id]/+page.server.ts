import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ parent, params }) => {
	const playlistId = Number(params.id)
	const { playlists, ...restProps } = await parent();
	const playlist = playlists.find((playlist) => playlist.id === playlistId);
	if (!playlist) {
		return error(404, 'Playlist not found');
	}

	return { playlist, ...restProps };
}) satisfies PageServerLoad;
