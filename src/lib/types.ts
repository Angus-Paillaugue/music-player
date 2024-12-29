export const songFormat = ['flac', 'mp3'] as const;

export interface Song {
	id: string;
	title: string;
	artist: Artist;
	duration: number;
	album?: Album;
	year: number;
	mediaType: typeof songFormat[number];
	addedAt: Date;
	filePath: string;
	coverPath: string;
}

export interface Playlist {
	id: string;
	title: string;
	songs: Song[];
}

export interface Album {
	id: number;
	title: string;
	songs: Song[];
}

export interface Artist {
	id: number;
	name: string
}
