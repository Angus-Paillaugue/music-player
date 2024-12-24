import { writable } from 'svelte/store';
import { type Album, type Playlist, type Song } from './types';

export const currentlyPlayingSong = writable<Song | null>(null);

export const isPlayingSong = writable<boolean>(false);

export const songs = writable<Song[]>([]);

export const albums = writable<Album[]>([]);

export const playlists = writable<Playlist[]>([]);
