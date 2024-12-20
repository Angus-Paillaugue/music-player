<script lang="ts">
	import '../app.css';
	import Player from '$lib/songs/Player/Player.svelte';
	import { type Album, type Playlist, type Song } from '$lib/types';
	import Nav from './nav.svelte';
	import { Home, ListMusic, Plus, Disc3 } from 'lucide-svelte';
	import Modal from '$lib/components/Modal.svelte';
	import Input from '$lib/components/Input.svelte';
	import Button from '$lib/components/Button.svelte';

  let { data, children } = $props();
  let songs = $state<Song[]>(data.songs);
  let playlists = $state<Playlist[]>(data.playlists);
  let createPlaylistModalOpen = $state<boolean>(false);
  let isCreatingPlaylist = $state<boolean>(false);
  let albums = $derived<Album[]>(getAlbums());

  async function createPlaylist(e: Event) {
    e.preventDefault();
    isCreatingPlaylist = true;
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    if (!name) return;
    const res = await fetch('/api/createPlaylist', {
      method: 'POST',
      body: JSON.stringify({ name }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      playlists = [...playlists, data.playlist];
      createPlaylistModalOpen = false;
    }else {
      console.error('Failed to create playlist');
    }
    isCreatingPlaylist = false;
  }

  // Shenanigans to group songs by their albums names
  function getAlbums(): Album[] {
    const albums: Album[] = []
    songs.forEach((item) => {
      const album = item.album;
      if(!album) return;
      if (!albums.find((a) => a.title === album)) {
        albums.push({ title: album, songs: [item] });
      }else {
        const index = albums.findIndex((a) => a.title === album);
        albums[index].songs.push(item);
      }
    });
    return albums;
  }
</script>

<Modal bind:open={createPlaylistModalOpen}>
  <form
    class="p-4 flex flex-col gap-2"
    onsubmit={createPlaylist}
  >
    <h2 class="text-lg font-bold">Create a new playlist</h2>
    <Input type="text" name="name" placeholder="Playlist name" />
    <Button class="ml-auto" loading={isCreatingPlaylist} disabled={isCreatingPlaylist}>Create</Button>
  </form>
</Modal>

<div class="h-svh flex flex-col overflow-hidden">
  <Nav bind:songs />
  <div class="w-full flex flex-row h-full">
    <!-- Sidebar -->
    <!-- TODO: Make it responsive -->
    <div class="flex flex-col max-w-[250px] overflow-y-auto w-full h-full border-r border-border">
      <!-- Top container -->
      <div class="p-4">
        <a href="/" class="rounded-lg hover:bg-secondary hover:ring-8 ring-secondary text-lg font-bold flex flex-row gap-2 transition-all items-center">
          <Home class="size-5" />
          Home
        </a>
      </div>
      <hr>
      <!-- Playlists section -->
      <div class="flex flex-col gap-2 mt-4 mb-2">
        <div class="flex flex-row gap-2 items-center px-4 group">
          <ListMusic class="size-5 shrink-0" />
          <h3 class="text-xl font-semibold grow">Playlists</h3>
          <button onclick={() => (createPlaylistModalOpen = true)} class="p-1.5 size-8 shrink-0 opacity-0 group-hover:opacity-100 transition-all bg-secondary rounded-lg">
            <Plus class="size-full" />
          </button>
        </div>
        <div class="flex flex-col p-2 gap-2">
          {#each playlists as playlist}
            <a href="/playlist/{playlist.name}" class="text-base px-2 py-1 font-base transition-all hover:bg-secondary hover:ring-4 ring-secondary rounded-lg flex flex-row items-center justify-between">
              <span>{playlist.name}</span>
              <span class="text-muted text-xs">({playlist.songs.length})</span>
            </a>
          {/each}
        </div>
      </div>
      <hr>
      <!-- Albums section -->
      <div class="flex flex-col gap-2 mt-4">
        <div class="flex flex-row gap-2 items-center px-4 group">
          <Disc3 class="size-5 shrink-0" />
          <h3 class="text-xl font-semibold grow">Albums</h3>
        </div>
        <div class="flex flex-col p-2 gap-2">
          {#each albums as album}
            <!-- TODO: add album page -->
            <a href="" class="text-base px-2 py-1 font-base transition-all hover:bg-secondary hover:ring-4 ring-secondary rounded-lg flex flex-row items-center justify-between">
              <span>{album.title}</span>
              <span class="text-muted text-xs">({album.songs.length})</span>
            </a>
          {/each}
        </div>
      </div>
    </div>
    <div class="grow overflow-y-auto h-full p-2">
      {@render children?.()}
    </div>
  </div>

  <Player {songs} bind:playlists />
</div>
