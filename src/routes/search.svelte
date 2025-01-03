<script lang="ts">
	import { Input, Button } from '$lib/components/';
	import { X } from 'lucide-svelte';
	import { currentlyPlayingSong } from '$lib/stores';
	import { searchSongs } from '$lib/utils';
	import { afterNavigate } from '$app/navigation';
	import type { Song } from '$lib/types';
	import Track from '$lib/songs/Track/Track.svelte';
	import { fade, fly, slide } from 'svelte/transition';

	let { open = $bindable(false) } = $props();

	let searchResults = $state<Song[]>([]);
	let searchInput = $state<ReturnType<typeof Input> | null>(null);
	let searchFocusIndex = $state<number>(0);

	// Closes the sidebar when navigating
	afterNavigate(() => {
		open = false;
	});

	function search(val: string) {
		if (!val) {
			return [];
		}
		return searchSongs(val);
	}

	// Focuses the search input when the modal opens
	$effect(() => {
		if (open) {
      // Delay because of the fly transition
			setTimeout(() => searchInput?.focus(), 300);
		}
	});

	function onWindowKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
		} else if (e.key === 'k' && e.ctrlKey) {
			e.preventDefault();
			open = true;
		}
	}

	// On search input keydown
	function onSearchKeyDown(e: KeyboardEvent) {
		// Search thru songs
		searchResults = search((e.target as HTMLInputElement).value);
		searchFocusIndex =
			searchFocusIndex >= searchResults.length ? searchResults.length - 1 : searchFocusIndex; // Reset focus index if it exceeds the search results length
		// Handle arrow key navigation
		if (e.key === 'ArrowDown') {
			searchFocusIndex = (searchFocusIndex + 1) % searchResults.length;
		} else if (e.key === 'ArrowUp') {
			searchFocusIndex = (searchFocusIndex - 1) % searchResults.length;
		} else if (e.key === 'Enter') {
			$currentlyPlayingSong = searchResults[searchFocusIndex]; // Play the song
			open = false; // Close the search modal
		}
	}
</script>

<svelte:window onkeydown={onWindowKeyDown} />

{#if open}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 bg-background/50 backdrop-blur-md"
		transition:fade={{ duration: 300 }}
		onclick={() => (open = false)}
	></div>

	<div class="pointer-events-none fixed inset-0 z-50 px-2 py-8">
		<div class="mx-auto flex w-full max-w-screen-md flex-col gap-8">
			<!-- Search input -->
			<div
				class="pointer-events-auto flex flex-row items-center gap-4 rounded-2xl border border-border bg-background p-2"
				transition:fly={{ duration: 300, y: '-100%' }}
			>
				<Input
					class="grow"
					type="text"
					name="search"
					placeholder="Search for a song"
					onkeyup={onSearchKeyDown}
					bind:this={searchInput}
				/>
				<Button
					aria-label="Close search modal"
					class="size-10 shrink-0 p-2.5"
					variant={['icon', 'secondary']}
					onclick={() => (open = false)}
				>
					<X class="size-full" />
				</Button>
			</div>

			<!-- Search results -->
			{#if searchResults.length > 0}
				<div
					class="no-scrollbar pointer-events-auto flex max-h-[50svh] w-full flex-col overflow-y-auto overflow-x-hidden rounded-2xl border border-border bg-background p-2"
					transition:slide|global={{ duration: 300, axis: 'y' }}
				>
					{#each searchResults as s, index (s.id)}
						<Track
							song={s}
							onclick={() => (open = false)}
							data-focused={searchFocusIndex === index}
						/>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}
