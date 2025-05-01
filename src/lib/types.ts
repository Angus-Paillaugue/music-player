export interface Song {
	id: string;
	path: string;
	title: string;
	artist: string;
	duration: number;
	album?: string;
	year: number;
	filename: string;
	addedAt: Date;
	cover: {
		format: string;
		type: string;
		description: string;
		data: Uint8Array;
	};
}

export interface Playlist {
	name: string;
	songs: Song[];
}

export interface Album {
	title: string;
	songs: Song[];
}
