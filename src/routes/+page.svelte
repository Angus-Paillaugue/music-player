<script lang="ts">
	import Track from '$lib/songs/Track.svelte';
	import { songs } from '$lib/stores.js';

	let { data } = $props();

	$songs = data.songs;
</script>

<div class="mx-auto flex w-full max-w-screen-lg flex-col gap-8">
	<div class="flex flex-col p-2">
		{#each $songs as song}
			<Track format="list" {song} />
		{/each}
	</div>

	<div class="flex flex-col gap-2">
		<h3 class="text-xl font-medium">Quick Picks</h3>
		<div class="grid grid-cols-3 gap-4">
			{#each $songs as song}
				<Track format="card" {song} />
			{/each}
		</div>
	</div>
</div>
