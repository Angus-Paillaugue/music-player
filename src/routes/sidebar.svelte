<script lang="ts">
	import { Modal, Input, Button } from '$lib/components/';
	import { Home, ListMusic, Plus, Disc3, Search, X } from 'lucide-svelte';
	import { playlists, albums, toast, currentlyPlayingSong } from '$lib/stores';
	import { cn, searchSongs } from '$lib/utils';
	import { afterNavigate } from '$app/navigation';
	import type { Song } from '$lib/types';
	import Track from '$lib/songs/Track/Track.svelte';
	import { fade, fly, slide } from 'svelte/transition';

	let { open = $bindable(false) } = $props();

	let createPlaylistModalOpen = $state<boolean>(false);
	let isCreatingPlaylist = $state<boolean>(false);
	let searchModalOpen = $state<boolean>(false);
	let searchResults = $state<Song[]>([]);
	let searchInput = $state<ReturnType<typeof Input> | null>(null);
	let searchFocusIndex = $state<number>(0);

	async function createPlaylist(e: Event) {
		e.preventDefault();
		isCreatingPlaylist = true;
		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);
		const title = formData.get('title') as string;
		if (!title) return;
		const res = await fetch('/api/playlist/create', {
			method: 'POST',
			body: JSON.stringify({ title }),
			headers: { 'Content-Type': 'application/json' }
		});
		if (res.ok) {
			const data = await res.json();
			$playlists = [...$playlists, data.playlist];
			createPlaylistModalOpen = false;
			toast.success('Playlist created successfully');
		} else {
			console.error('Failed to create playlist');
			toast.error('Failed to create playlist');
		}
		isCreatingPlaylist = false;
	}

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
		if (searchModalOpen) {
			setTimeout(() => searchInput?.focus(), 300);
		}
	});

	function onWindowKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			searchModalOpen = false;
		} else if (e.key === 'k' && e.ctrlKey) {
			e.preventDefault();
			searchModalOpen = true;
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
			searchModalOpen = false; // Close the search modal
		}
	}
</script>

<svelte:window onkeydown={onWindowKeyDown} />

<!-- Create playlist modal -->
<Modal bind:open={createPlaylistModalOpen}>
	<form class="flex flex-col gap-2 p-4" onsubmit={createPlaylist}>
		<h2 class="text-lg font-medium">Create a new playlist</h2>
		<Input type="text" name="title" placeholder="Playlist title" />
		<Button class="ml-auto" loading={isCreatingPlaylist} disabled={isCreatingPlaylist}
			>Create</Button
		>
	</form>
</Modal>

<!-- Song search modal -->
{#if searchModalOpen}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 bg-background/50 backdrop-blur-md"
		transition:fade={{ duration: 300 }}
		onclick={() => (searchModalOpen = false)}
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
					onclick={() => (searchModalOpen = false)}
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
							onclick={() => (searchModalOpen = false)}
							data-focused={searchFocusIndex === index}
						/>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}

<div
	class={cn(
		'flex h-full w-full shrink-0 flex-col border-r border-border bg-background/95 transition-transform max-lg:fixed max-lg:bottom-0 max-lg:left-0 max-lg:top-16 max-lg:z-30 max-lg:max-w-[75%] max-lg:backdrop-blur-md max-sm:max-w-full lg:max-w-[250px]',
		open ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full'
	)}
>
	<div class="flex flex-col gap-4 p-4">
		<a
			href="/"
			class="flex flex-row items-center gap-2 rounded-lg text-lg font-bold ring-secondary transition-all hover:bg-secondary hover:ring-8"
		>
			<Home class="size-5" />
			Home
		</a>
		<button
			class="flex flex-row items-center gap-2 rounded-lg text-lg font-bold ring-secondary transition-all hover:bg-secondary hover:ring-8"
			onclick={() => (searchModalOpen = true)}
		>
			<Search class="size-5" />
			Search
		</button>
	</div>
	<hr />
	<div class="flex flex-col overflow-y-auto">
		<div class={cn('mb-2 mt-4 flex flex-col gap-2', $playlists.length === 0 && 'my-4')}>
			<div class="group flex shrink-0 flex-row items-center gap-2 px-4">
				<ListMusic class="size-5 shrink-0" />
				<h3 class="grow text-xl font-semibold">Playlists</h3>
				<button
					onclick={() => (createPlaylistModalOpen = true)}
					class="size-8 shrink-0 rounded-lg bg-secondary p-1.5 opacity-0 transition-all group-hover:opacity-100"
				>
					<Plus class="size-full" />
				</button>
			</div>
			{#if $playlists.length > 0}
				<div class="flex max-h-[400px] shrink-0 flex-col gap-2 overflow-y-auto p-2">
					{#each $playlists as playlist}
						<a
							href="/playlist/{playlist.id}"
							class="font-base flex flex-row items-center justify-between rounded-lg px-2 py-1 text-base ring-secondary transition-all hover:bg-secondary hover:ring-4"
						>
							<span class="line-clamp-1">{playlist.title}</span>
							<span class="text-xs text-muted">({playlist.songs.length})</span>
						</a>
					{/each}
				</div>
			{/if}
		</div>
		<hr />

		<div class="mt-4 flex flex-col gap-2">
			<div class="group flex flex-row items-center gap-2 px-4">
				<Disc3 class="size-5 shrink-0" />
				<h3 class="grow text-xl font-semibold">Albums</h3>
			</div>
			<div class="flex max-h-[400px] shrink-0 flex-col gap-2 overflow-y-auto p-2">
				{#each $albums as album}
					<!-- TODO: make the album page -->
					<a
						href=""
						class="font-base flex flex-row items-center justify-between rounded-lg px-2 py-1 text-base ring-secondary transition-all hover:bg-secondary hover:ring-4"
					>
						<span class="line-clamp-1">{album.title}</span>
						<span class="text-xs text-muted">({album.songs.length})</span>
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>
