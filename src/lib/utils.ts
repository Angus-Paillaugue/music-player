import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Song } from './types';
import { get } from 'svelte/store';
import { songs } from './stores';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatTime(secs: number) {
	const pad = (n: number) => (n < 10 ? `0${n}` : n);
	const h = Math.floor(secs / 3600);
	const m = Math.floor(secs / 60) - h * 60;
	const s = Math.floor(secs - h * 3600 - m * 60);

	return `${pad(m)}:${pad(s)}`;
}

export function generateRandomString(length: number) {
	return new Array(length)
		.fill(0)
		.map((c) =>
			(+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
		)
		.join('');
}

function levenshtein(a: string, b: string): number {
	const an = a ? a.length : 0;
	const bn = b ? b.length : 0;
	if (an === 0) {
		return bn;
	}
	if (bn === 0) {
		return an;
	}
	const matrix = new Array<number[]>(bn + 1);
	for (let i = 0; i <= bn; ++i) {
		const row = (matrix[i] = new Array<number>(an + 1));
		row[0] = i;
	}
	const firstRow = matrix[0];
	for (let j = 1; j <= an; ++j) {
		firstRow[j] = j;
	}
	for (let i = 1; i <= bn; ++i) {
		for (let j = 1; j <= an; ++j) {
			if (b.charAt(i - 1) === a.charAt(j - 1)) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] =
					Math.min(
						matrix[i - 1][j - 1], // substitution
						matrix[i][j - 1], // insertion
						matrix[i - 1][j] // deletion
					) + 1;
			}
		}
	}
	return matrix[bn][an];
}

export function searchSongs(search: string, s?: Song[]): Song[] {
	s ??= get(songs);
	// Normalize the search string
	const normalizedSearch = search.trim().toLowerCase();

	// Early exit for empty search
	if (!normalizedSearch) return s;

	const maxLevenshteinDistance = Math.max(2, Math.floor(normalizedSearch.length * 0.5)); // Allow leniency based on input length

	// Filter and rank songs based on relevance
	const rankedSongs = s
		.map((song) => {
			const normalizedTitle = song.title.toLowerCase();
			const exactMatchIndex = normalizedTitle.indexOf(normalizedSearch);
			const distance = levenshtein(normalizedSearch, normalizedTitle);

			// Determine rank based on substring match or Levenshtein distance
			const rank = exactMatchIndex !== -1 ? 0 : distance;

			return { song, rank, distance, exactMatchIndex };
		})
		.filter(({ rank, distance }) => rank === 0 || distance <= maxLevenshteinDistance) // Filter out irrelevant matches
		.sort((a, b) => {
			// Prioritize exact substring matches (rank) and sort by Levenshtein distance
			if (a.rank !== b.rank) return a.rank - b.rank;
			return a.distance - b.distance;
		});

	// Return sorted and filtered songs
	return rankedSongs.map(({ song }) => song);
}
