<script lang="ts">
	import Track from '$lib/songs/Track.svelte';
	import type { Playlist, Song } from '$lib/types';
  import { currentlyPlayingSong } from '$lib/stores';

  let { data } = $props();

  let playlist = $state<Playlist>(data.playlist);
</script>


<div class="max-w-screen-lg w-full mx-auto flex flex-col gap-8">
  <h1 class="text-2xl font-bold">
    {playlist.name}
  </h1>
  <div class="flex flex-col p-2">
    {#each playlist.songs as song}
      <Track format="list" {song} isPlaying={$currentlyPlayingSong?.path === song.path} play={(s: Song) => ($currentlyPlayingSong = s)} />
    {:else}
      <div class="flex flex-col gap-2 items-center justify-center">
        <p class="text-3xl font-medium">No songs found</p>
      </div>
    {/each}
  </div>
</div>
