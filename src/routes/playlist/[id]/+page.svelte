<script lang="ts">
	import Track from '$lib/songs/Track.svelte';
	import type { Playlist } from '$lib/types';

	let { data } = $props();

	let playlist = $state<Playlist>(data.playlist);
</script>

<div class="mx-auto flex w-full max-w-screen-lg flex-col gap-8">
	<h1 class="text-2xl font-bold">
		{playlist.title}
	</h1>
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
