import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAllPlaylists } from '$lib/db/playlist';

export const GET: RequestHandler = async () => {
  const playlists = await getAllPlaylists();
  return json(playlists);
};
