<script lang="ts">
	import { Alert, Button, Input, Modal, Select } from '$lib/components/';
	import { playlists, songs, toast, albums } from '$lib/stores';
	import { Download, Menu, X } from 'lucide-svelte';
	import { songFormat, type Album, type Playlist, type Song } from '$lib/types';
	import { scale } from 'svelte/transition';

	let { sidebarOpen = $bindable(false) } = $props();
	let isDownloadingSong = $state<boolean>(false);
	let downloadSongModalOpen = $state<boolean>(false);
	let downloadError = $state<string | null>(null);
	let playlistDownloadingResponseStreamData = $state<{
		event: 'playlistName' | 'songIndex' | 'end' | 'error';
		playlistName: string;
		songs: { total: number; current: number };
	} | null>(null);

	const isUrlAPlaylist = (url: URL) => {
		return url.searchParams.has('list') && !url.searchParams.has('v');
	};

	async function downloadPlaylist(songURL: URL, format: typeof songFormat) {
		const response = await fetch(
			`/api/playlist/download?playlistId=${songURL.searchParams.get('list')}&format=${format}`
		);
		const body = response.body as ReadableStream<Uint8Array>;
		const reader = body.pipeThrough(new TextDecoderStream()).getReader();
		playlistDownloadingResponseStreamData = {
			event: 'playlistName',
			playlistName: '',
			songs: { total: -1, current: -1 }
		};
		while (true) {
			let { value, done } = await reader.read();
			if (done) break;
			if (!value) continue;
			const parsedValue: {
				event: (typeof playlistDownloadingResponseStreamData)['event'];
				data:
					| string
					| { total: number; current: number }
					| { playlists: Playlist[]; songs: Song[]; albums: Album[] };
			} = JSON.parse(value);
			if (!parsedValue) continue;
			switch (parsedValue.event) {
				case 'playlistName': {
					playlistDownloadingResponseStreamData.playlistName = parsedValue.data as string;
					break;
				}
				case 'songIndex': {
					playlistDownloadingResponseStreamData.songs = parsedValue.data as {
						total: number;
						current: number;
					};
					break;
				}
				case 'end': {
					toast.success('Playlist downloaded successfully');
					downloadSongModalOpen = false;
					const p = parsedValue.data as { playlists: Playlist[]; songs: Song[]; albums: Album[] };
					$playlists = p.playlists;
					$songs = p.songs;
					$albums = p.albums;
					break;
				}
				case 'error': {
					downloadError = parsedValue.data as string;
					break;
				}
			}
		}
	}

	async function downloadSong(e: Event) {
		e.preventDefault();
		isDownloadingSong = true;
		downloadError = null;
		playlistDownloadingResponseStreamData = null;
		try {
			const form = e.target as HTMLFormElement;
			const formData = new FormData(form);
			const songURL = new URL(formData.get('url') as string);
			const songId = songURL.searchParams.get('v');
			const format = formData.get('songFormat') as unknown as typeof songFormat;
			if (isUrlAPlaylist(songURL)) {
				// Download a playlist
				await downloadPlaylist(songURL, format);
			} else {
				// Download a single song
				const res = await fetch(`/api/song/download`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ songId, format })
				});
				const data = await res.json();
				if (!res.ok && data?.message) {
					throw new Error(data.message);
				}
				if (!res.ok || !data) {
					throw new Error(res.statusText);
				}

				downloadSongModalOpen = false;
				$songs.unshift(data.song);
				toast.success('Song downloaded successfully');
			}
		} catch (e) {
			if (e instanceof Error) {
				downloadError = e.message;
			} else {
				downloadError = e as string;
			}
		} finally {
			isDownloadingSong = false;
			playlistDownloadingResponseStreamData = null;
		}
	}
</script>

<Modal bind:open={downloadSongModalOpen}>
	<h2 class="text-lg font-medium">Download song</h2>
	<form onsubmit={(e) => downloadSong(e)} method="post" class="mt-4 flex flex-col gap-4">
		<div class="flex flex-row gap-4">
			<Input
				class="grow"
				type="text"
				name="url"
				placeholder="Song/Playlist URL"
				disabled={isDownloadingSong}
			/>
			<Select name="songFormat" id="songFormat" class="shrink-0">
				{#each songFormat as format}
					<option value={format}>{format}</option>
				{/each}
			</Select>
		</div>
		{#if playlistDownloadingResponseStreamData && playlistDownloadingResponseStreamData.songs.total !== -1}
			<div class="flex flex-row justify-between">
				<p>Downloading <b>{playlistDownloadingResponseStreamData.playlistName}</b></p>
				<p class="font-mono text-sm font-bold">
					{playlistDownloadingResponseStreamData.songs
						.current}/{playlistDownloadingResponseStreamData.songs.total}
				</p>
			</div>
			<div class="h-4 w-full overflow-hidden rounded-full bg-secondary">
				<div
					class="flex h-full flex-row items-center justify-center bg-foreground text-center transition-all"
					style:width={(playlistDownloadingResponseStreamData.songs.current /
						playlistDownloadingResponseStreamData.songs.total) *
						100 +
						'%'}
				>
					<span class="whitespace-nowrap font-mono text-sm font-bold text-background">
						{Math.round(
							(playlistDownloadingResponseStreamData.songs.current /
								playlistDownloadingResponseStreamData.songs.total) *
								100
						)} %
					</span>
				</div>
			</div>
		{/if}
		{#if downloadError}
			<Alert>{downloadError}</Alert>
		{/if}
		<Button class="ml-auto" disabled={isDownloadingSong} loading={isDownloadingSong} type="submit"
			>Download</Button
		>
	</form>
</Modal>

<div class="flex h-16 shrink-0 flex-row items-center justify-between border-b border-border p-4">
	<Button variant="icon" onclick={() => (downloadSongModalOpen = true)}>
		<Download class="size-full" />
	</Button>
	<Button
		class="lg:hidden"
		variant={['icon', 'border']}
		onclick={() => (sidebarOpen = !sidebarOpen)}
	>
		{#if sidebarOpen}
			<span class="size-full" in:scale>
				<X class="size-full" />
			</span>
		{:else}
			<span class="size-full" in:scale>
				<Menu class="size-full" />
			</span>
		{/if}
	</Button>
	<div class="max-lg:hidden"></div>
</div>
