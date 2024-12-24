<script lang="ts">
	import { currentlyPlayingSong, isPlayingSong } from '$lib/stores';
	import type { Song } from '$lib/types';
	import { cn, formatTime } from '$lib/utils';
	import Cover from './Cover.svelte';

	interface Props {
		song: Song;
		format?: 'list' | 'card';
	}

	let { song, format = 'list' }: Props = $props();
	let isSongSelected = $derived($currentlyPlayingSong?.id === song.id);

	function play() {
		$currentlyPlayingSong = song;
	}
</script>

{#if format === 'list'}
	<button
		onclick={play}
		class={cn(
			'text-text track flex w-full flex-row items-center justify-start gap-4 overflow-hidden rounded-lg p-2 transition-colors',
			isSongSelected ? 'bg-secondary ring-2 ring-secondary' : ''
		)}
		data-track-id={song.id}
	>
		<!-- cover -->
		<div class="relative size-12 overflow-hidden rounded-lg">
			<div class="absolute inset-0 -z-10 size-full animate-pulse bg-secondary"></div>
			<Cover
				{song}
				isPlaying={$isPlayingSong}
				isSelected={isSongSelected}
				class="size-full object-cover"
			/>
		</div>
		<div class="flex flex-col text-start">
			<h3 class="text-base font-medium">{song.title}</h3>
			<p class="text-sm text-muted">{song.artist.name} - {formatTime(song.duration)}</p>
		</div>
	</button>
{:else}
	<button
		onclick={play}
		class={cn(
			'text-text track flex flex-col gap-2 rounded-xl p-2',
			isSongSelected ? 'bg-secondary ring-2 ring-secondary' : ''
		)}
		data-track-id={song.id}
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
			<h3 class="text-base font-medium">{song.title}</h3>
			<p class="text-sm text-muted">{song.artist}</p>
		</div>
	</button>
{/if}
