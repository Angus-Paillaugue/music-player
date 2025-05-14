import { getAllSongs } from '$lib/db/song';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const songs = await getAllSongs();
  return json(songs);
};
