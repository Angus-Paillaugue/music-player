import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { toggleSongFromPlaylist } from '$lib/db/playlist';
import type { Playlist, Song } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
	const { song, playlist } = (await request.json()) as { song: Song; playlist: Playlist };

	try {
		const isNowInPlaylist = await toggleSongFromPlaylist(song, playlist);

		return json({ success: true, message: 'Song added to playlist', isNowInPlaylist });
	} catch (e) {
		return json({ error: e instanceof Error ? e.message : e }, { status: 500 });
	}
};
