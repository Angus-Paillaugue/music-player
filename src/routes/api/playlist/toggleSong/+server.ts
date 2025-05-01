import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { toggleSongFromPlaylist } from '$lib/db/playlist';
import type { Playlist, Song } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
<<<<<<< HEAD:src/routes/api/toggleSongFromPlaylist/+server.ts
	const { song, playlistName } = (await request.json()) as { song: Song; playlistName: string };
=======
	const { song, playlist } = (await request.json()) as { song: Song; playlist: Playlist };
>>>>>>> 143c8cb1d79d04e831b6fc8a4c16eb9bf80d3b4d:src/routes/api/playlist/toggleSong/+server.ts

	try {
		const isNowInPlaylist = await toggleSongFromPlaylist(song, playlist);

		return json({ success: true, message: 'Song added to playlist', isNowInPlaylist });
	} catch (e) {
		return json({ error: e instanceof Error ? e.message : e }, { status: 500 });
	}
};
