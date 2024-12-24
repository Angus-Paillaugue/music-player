<script lang="ts">
  import Modal from '$lib/components/Modal.svelte';
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';
	import { Home, ListMusic, Plus, Disc3 } from 'lucide-svelte';
	import { playlists, albums } from '$lib/stores';
	import type { Album } from '$lib/types';

	let createPlaylistModalOpen = $state<boolean>(false);
	let isCreatingPlaylist = $state<boolean>(false);

	async function createPlaylist(e: Event) {
		e.preventDefault();
		isCreatingPlaylist = true;
		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);
		const title = formData.get('title') as string;
		if (!title) return;
		const res = await fetch('/api/createPlaylist', {
			method: 'POST',
			body: JSON.stringify({ title }),
			headers: { 'Content-Type': 'application/json' }
		});
		if (res.ok) {
			const data = await res.json();
			$playlists = [...$playlists, data.playlist];
			createPlaylistModalOpen = false;
		} else {
			console.error('Failed to create playlist');
		}
		isCreatingPlaylist = false;
	}
</script>

<Modal bind:open={createPlaylistModalOpen}>
	<form class="flex flex-col gap-2 p-4" onsubmit={createPlaylist}>
		<h2 class="text-lg font-bold">Create a new playlist</h2>
		<Input type="text" name="title" placeholder="Playlist title" />
		<Button class="ml-auto" loading={isCreatingPlaylist} disabled={isCreatingPlaylist}
			>Create</Button
		>
	</form>
</Modal>

<div class="flex h-full w-full max-w-[250px] shrink-0 flex-col border-r border-border">
  <div class="p-4">
    <a
      href="/"
      class="flex flex-row items-center gap-2 rounded-lg text-lg font-bold ring-secondary transition-all hover:bg-secondary hover:ring-8"
    >
      <Home class="size-5" />
      Home
    </a>
  </div>
  <hr />
  <div class="flex flex-col overflow-y-auto">
    <div class="mb-2 mt-4 flex flex-col gap-2">
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
      <div class="flex max-h-[400px] shrink-0 flex-col gap-2 overflow-y-auto p-2">
        {#each $playlists as playlist}
          <a
            href="/playlist/{playlist.id}"
            class="font-base flex flex-row items-center justify-between rounded-lg px-2 py-1 text-base ring-secondary transition-all hover:bg-secondary hover:ring-4"
          >
            <span>{playlist.title}</span>
            <span class="text-xs text-muted">({playlist.songs.length})</span>
          </a>
        {/each}
      </div>
    </div>
    <hr />

    <div class="mt-4 flex flex-col gap-2">
      <div class="group flex flex-row items-center gap-2 px-4">
        <Disc3 class="size-5 shrink-0" />
        <h3 class="grow text-xl font-semibold">Albums</h3>
      </div>
      <div class="flex max-h-[400px] shrink-0 flex-col gap-2 overflow-y-auto p-2">
        {#each $albums as album}
          <a
            href=""
            class="font-base flex flex-row items-center justify-between rounded-lg px-2 py-1 text-base ring-secondary transition-all hover:bg-secondary hover:ring-4"
          >
            <span>{album.title}</span>
            <span class="text-xs text-muted">({album.songs.length})</span>
          </a>
        {/each}
      </div>
    </div>
  </div>
</div>
