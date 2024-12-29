<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import { playlists, toast } from '$lib/stores';
	import type { Playlist, Song } from '$lib/types';
	import { cn } from '$lib/utils';

	interface Props {
		open: boolean;
		song: Song;
	}

	let { open = $bindable(false), song }: Props = $props();

	async function addSongToPlaylist(playlist: Playlist) {
		const res = await fetch(`/api/playlist/toggleSong`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ song: song, playlist })
		});

		if (res.ok) {
			open = false;
		}

		const data = await res.json();
		if (data.error) {
			console.error(data.error);
			toast.error(data.error);
		} else {
			if (data.isNowInPlaylist && song) {
				$playlists = $playlists.map((playlist) => {
					if (playlist.id === playlist.id) {
						return {
							...playlist,
							songs: [...playlist.songs.filter((s) => s !== null), song].filter(
								(s) => s !== null
							) as Song[]
						};
					}
					return playlist;
				});
			} else {
				$playlists = $playlists.map((playlist) => {
					if (playlist.id === playlist.id) {
						return {
							...playlist,
							songs: playlist.songs.filter((s) => s !== null && song && s.id !== song.id)
						};
					}
					return playlist;
				});
			}

			toast.success('Song added to playlist successfully');
		}
	}
</script>

<Modal bind:open>
	<div class="flex flex-col gap-4">
		<h2 class="text-lg font-medium">Add to playlist</h2>
		<div class="flex flex-col gap-1">
			{#each $playlists as playlist}
				<button
					class={cn(
						'flex flex-row items-center gap-2 rounded-lg px-2 py-1 transition-all',
						song && playlist.songs.map((s) => s.id).includes(song.id) ? 'bg-secondary' : ''
					)}
					onclick={() => addSongToPlaylist(playlist)}
				>
					<span class="text-base font-medium">{playlist.title}</span>
					<span class="text-sm text-muted">({playlist.songs.length})</span>
				</button>
			{/each}
		</div>
	</div>
</Modal>
