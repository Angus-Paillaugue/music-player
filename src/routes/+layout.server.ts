import type { LayoutServerLoad, Actions } from './$types';
import { getAllSongs, getPlaylists } from '$lib/songs';

export const load = (async () => {
  const songs = await getAllSongs();
  const playlists = await getPlaylists();
  return { songs, playlists };
}) satisfies LayoutServerLoad;
