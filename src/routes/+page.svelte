<script lang="ts">
	import Track from '$lib/songs/Track.svelte';
	import type{ Song } from '$lib/types';
  import { currentlyPlayingSong } from '$lib/stores';

  let { data } = $props();

  let songs = $state<Song[]>(data.songs);
</script>


<div class="max-w-screen-lg w-full mx-auto flex flex-col gap-8">
  <div class="flex flex-col p-2">
    {#each songs as song}
      <Track format="list" {song} isPlaying={$currentlyPlayingSong?.path === song.path} play={(s: Song) => ($currentlyPlayingSong = s)} />
    {/each}
  </div>

  <div class="flex flex-col gap-2">
    <h3 class="text-xl font-medium">Quick Picks</h3>
    <div class="grid grid-cols-3 gap-4">
      {#each songs as song}
        <Track format="card" {song} isPlaying={$currentlyPlayingSong?.path === song.path} play={(s: Song) => ($currentlyPlayingSong = s)} />
      {/each}
    </div>
  </div>
</div>
