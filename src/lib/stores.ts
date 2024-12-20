import { writable } from "svelte/store";
import type { Song } from "./types";

export const currentlyPlayingSong = writable<Song | null>(null);
