<script lang="ts">
	import Grid from '$lib/songs/Track/Grid.svelte';
	import List from '$lib/songs/Track/List.svelte';
	import { songs, songsToPlay } from '$lib/stores';

	let { data } = $props();

	$songs = data.songs;
	$songsToPlay = data.songs;

	const GRID_SIZE = 2 * 3 * 3; // 2 rows, 3 columns, 3 pages
</script>

<div class="mx-auto flex w-full max-w-screen-lg flex-col gap-8">
	<!-- Quick picks section -->
	<div class="flex flex-col gap-1">
		<h2 class="text-xl font-medium px-2">Quick picks</h2>
		<Grid songs={$songs.slice(0, GRID_SIZE)} />
	</div>

	<!-- All songs section -->
	<div class="flex flex-col gap-1">
		<h2 class="text-xl font-medium px-2">All songs</h2>
		<List songs={$songs} />
	</div>
</div>
