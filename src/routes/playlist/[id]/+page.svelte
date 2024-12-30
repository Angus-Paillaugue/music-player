<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Track from '$lib/songs/Track/Track.svelte';
	import { playlists, songsToPlay, toast } from '$lib/stores';
	import type { Playlist } from '$lib/types';
	import { PenIcon, Trash2 } from 'lucide-svelte';

	let { data } = $props();

	// Playlist cannot be null or undefined because an error would have been thrown on the server
	let playlist = $state<Playlist>(
		$playlists.find((p) => p.id === data.id)
	);
	let ediPlaylistModalOpen = $state<boolean>(false);
	let isSavingPlaylist = $state<boolean>(false);
	let deletePlaylistModalOpen = $state<boolean>(false);
	let isDeletingPlaylist = $state<boolean>(false);
	// svelte-ignore state_referenced_locally
	let editedPlaylist = $state(JSON.parse(JSON.stringify(playlist)));

	// svelte-ignore state_referenced_locally
	$songsToPlay = playlist.songs;

	async function updatePlaylist(e: Event) {
		e.preventDefault();
		isSavingPlaylist = true;

		const res = await fetch(`/api/playlist/save`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({playlist: editedPlaylist}),
		});

		if (res.ok) {
			ediPlaylistModalOpen = false;
			playlist = editedPlaylist;
			const index = $playlists.findIndex((p) => p.id === playlist.id);
			if (index !== -1) {
				$playlists[index] = playlist;
			}
			toast.success('Playlist saved successfully');
		}else {
			toast.error('Failed to save playlist');
		}

		isSavingPlaylist = false;
	}

	$effect(() => {
		playlist = $playlists.find((p) => p.id === data.id) || null;
	});
</script>

<svelte:head>
	<title>{playlist.title}</title>
</svelte:head>

<Modal bind:open={deletePlaylistModalOpen}>
	<h2 class="text-lg font-medium">Delete playlist</h2>
	<p class="text-sm">Are you sure you want to delete this playlist?</p>
	<form
		action="?/deletePlaylist"
		method="POST"
		class="flex flex-row justify-between mt-2"
		use:enhance={() => {
			isDeletingPlaylist = true;
			return async ({ update }) => {
				await update();
				isDeletingPlaylist = false;
			};
		}}
	>
		<Button
			type="button"
			variant="secondary"
			onclick={() => {deletePlaylistModalOpen = false; ediPlaylistModalOpen = true;}}
		>
			Cancel
		</Button>
		<Button
			type="submit"
			variant="destructive"
			loading={isDeletingPlaylist}
			disabled={isDeletingPlaylist}
		>
			Delete
		</Button>
	</form>
</Modal>

<Modal bind:open={ediPlaylistModalOpen}>
	<h2 class="text-xl font-medium">Edit playlist</h2>

	<form
		method="POST"
		class="flex flex-col gap-2"
		onsubmit={updatePlaylist}
	>

		<div class="flex flex-col gap-1 mt-4">
			<label for="playlistTitle">Title</label>
			<Input bind:value={editedPlaylist.title} name="playlistTitle" />
		</div>

		<div class="flex flex-row justify-between">
			<Button
				type="button"
				variant="destructive"
				onclick={() => {ediPlaylistModalOpen = false; deletePlaylistModalOpen = true;}}
			>
				<Trash2 class="size-4" />
				Delete
			</Button>
			<Button
				type="submit"
				disabled={isSavingPlaylist}
				loading={isSavingPlaylist}
			>
				Save
			</Button>
		</div>

	</form>

</Modal>

<div class="mx-auto flex w-full max-w-screen-lg flex-col gap-4 mt-4">
	<div
		class="flex flex-row items-center justify-between"
	>
		<h1 class="text-2xl font-bold">
			{playlist.title}
		</h1>

		<Button class="size-7 p-1.5" onclick={() => ediPlaylistModalOpen = true}>
			<PenIcon class="size-full" />
		</Button>
	</div>
	<div class="flex flex-col p-2">
		{#each playlist.songs as song}
			<Track format="list" {song} />
		{:else}
			<div class="flex flex-col gap-2 items-center justify-center">
				<p class="text-3xl font-medium">No songs found</p>
			</div>
		{/each}
	</div>
</div>
