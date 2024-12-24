import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec } from 'child_process';
import fs from 'fs';
import { join } from 'path';
import { refreshSongs } from '$lib/songs';
import { getSongFromId } from '$lib/db/song';

async function downloadSong(songId: string) {
	const completeDir = './songs';
	const incompleteDir = completeDir + '/.incomplete/';
	if (!fs.existsSync(incompleteDir)) {
		fs.mkdirSync(incompleteDir, { recursive: true });
	}
	if (!fs.existsSync(completeDir)) {
		fs.mkdirSync(completeDir, { recursive: true });
	}

	const command = `yt-dlp -x --audio-format flac --audio-quality 320k \
      --embed-thumbnail --embed-metadata \
      -o "${incompleteDir}/${songId}.%(ext)s" \
      "https://www.youtube.com/watch?v=${songId}"`;

	return new Promise<void>((resolve, reject) => {
		exec(command, async (error) => {
			if (error) {
				// Delete any incomplete file
				const files = fs.readdirSync(incompleteDir);
				files.forEach((file) => {
					if (file.includes(songId)) {
						fs.unlinkSync(join(incompleteDir, file));
					}
				});

				return reject(error);
			}

			// Move file to the complete directory
			const files = fs.readdirSync(incompleteDir);
			files.forEach((file) => {
				const oldPath = join(incompleteDir, file);
				const newPath = join(completeDir, file);
				fs.renameSync(oldPath, newPath);
			});

			resolve();
		});
	});
}

export const POST: RequestHandler = async ({ request }) => {
	const { songId } = await request.json();
	if (!songId) {
		throw new Error('Song ID is required.');
	}

	try {
		await downloadSong(songId);
		await refreshSongs();
		const song = await getSongFromId(songId);
		return json({ song, success: true, message: 'Song downloaded successfully.' });
	} catch (error) {
		return json({ success: false, message: error instanceof Error ? error.message : error });
	}
};
