<script lang="ts">
	import Track from '$lib/songs/Track/Track.svelte';
	import { songsToPlay } from '$lib/stores';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const { artist } = data;

	$songsToPlay = artist.songs;
</script>

<svelte:head>
	<title>{artist.name}</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-screen-lg flex-col gap-4 mt-4">
  <h1 class="text-4xl font-bold">
    {artist.name}
  </h1>
	<div class="flex flex-col p-2">
		{#each artist.songs as song}
			<Track format="list" {song} />
		{:else}
			<div class="flex flex-col gap-2 items-center justify-center">
				<p class="text-3xl font-medium">No songs found</p>
			</div>
		{/each}
	</div>
</div>
