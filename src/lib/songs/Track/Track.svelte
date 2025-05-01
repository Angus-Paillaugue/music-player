<script lang="ts">
	import { currentlyPlayingSong, isPlayingSong, playlists, toast } from '$lib/stores';
	import type { Song } from '$lib/types';
	import { formatTime } from '$lib/utils';
	import Cover from '../Cover.svelte';
	import { page } from '$app/state';
	import { Trash2 } from 'lucide-svelte';
	import { Link } from '$lib/components/';
	import type { SvelteHTMLElements } from 'svelte/elements';

	interface Props {
		song: Song;
		format?: 'list' | 'card';
	}

	let { song, format = 'list', ...restProps }: Props & SvelteHTMLElements['div'] = $props();
	let isSongSelected = $derived($currentlyPlayingSong?.id === song.id);

	function play(e: MouseEvent) {
		const target = e.target as HTMLElement;
		// Do not play the song if the user clicks on a button or the track is disabled or the click is not the left button
		if (
			target.closest('button') ||
			target.closest('a') ||
			target.closest('.track')?.classList.contains('disabled') ||
			e.button !== 0
		)
			return;
		$currentlyPlayingSong = song;
	}

	async function removeSongFromPlaylist(e: Event) {
		e.preventDefault();
		const playlistId = page.params.id;

		const res = await fetch(`/api/playlist/${playlistId}/removeSong`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ song })
		});

		if (res.ok) {
			// Remove the song from the playlist
			const index = $playlists.findIndex((p) => p.id === playlistId);
			$playlists[index].songs = $playlists[index].songs.filter((s) => s.id !== song.id);
			const data = await res.json();
			toast.success(data.message);
		} else {
			toast.error('Failed to remove song from playlist');
		}
	}
</script>

{#if format === 'list'}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		onmouseup={play}
		class="text-text track flex w-full shrink-0 cursor-pointer flex-row items-center justify-start gap-4 overflow-hidden rounded-lg p-2 transition-colors hover:bg-secondary hover:ring-2 hover:ring-secondary data-[focused='true']:bg-secondary data-[focused='true']:ring-2 data-[focused='true']:ring-secondary"
		data-track-id={song.id}
		data-focused={isSongSelected}
		{...restProps}
	>
		<!-- cover -->
		<div class="relative size-12 shrink-0 overflow-hidden rounded-lg">
			<div class="absolute inset-0 -z-10 size-full animate-pulse bg-secondary"></div>
			<Cover
				{song}
				isPlaying={$isPlayingSong}
				isSelected={isSongSelected}
				class="size-full object-cover"
			/>
		</div>
		<div class="flex grow flex-col text-start">
			<h3 class="text-base font-medium">{song.title}</h3>
			<p class="text-sm text-muted">
				<Link href="/artist/{song.artist.id}">{song.artist.name}</Link> - {formatTime(
					song.duration
				)}
			</p>
		</div>

		{#if page.route.id === '/playlist/[id]'}
			<!-- Is in a playlist page -->
			<button
				class="group rounded-lg p-2 transition-colors hover:bg-destructive"
				onclick={removeSongFromPlaylist}
			>
				<Trash2
					class="size-5 text-muted transition-colors group-hover:text-destructive-foreground"
				/>
			</button>
		{/if}
	</div>
{:else}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		onmouseup={play}
		class="text-text track flex shrink-0 cursor-pointer flex-col gap-2 rounded-xl p-2 hover:bg-secondary hover:ring-2 hover:ring-secondary data-[focused='true']:bg-secondary data-[focused='true']:ring-2 data-[focused='true']:ring-secondary"
		data-track-id={song.id}
		data-focused={isSongSelected}
		{...restProps}
	>
		<!-- Cover -->
		<div class="relative w-full overflow-hidden rounded-lg">
			<div class="absolute inset-0 -z-10 size-full animate-pulse bg-secondary"></div>
			<Cover
				{song}
				isPlaying={$isPlayingSong}
				isSelected={isSongSelected}
				class="aspect-square w-full object-cover"
			/>
		</div>

		<!-- Details -->
		<div class="flex flex-col gap-1">
			<h3 class="line-clamp-2 text-base font-medium">{song.title}</h3>
			<Link class="text-sm text-muted" href="/artist/{song.artist.id}"
				><p class="line-clamp-2">{song.artist.name}</p></Link
			>
		</div>
	</div>
{/if}
