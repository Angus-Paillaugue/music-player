<script lang="ts">
	import type { Song } from '$lib/types';
	import { cn } from '$lib/utils';
	import type { SvelteHTMLElements } from 'svelte/elements';
	import Track from './Track.svelte';

	interface Props {
		songs: Song[];
	}

	let { songs, class: className, ...restProps }: Props & SvelteHTMLElements['div'] = $props();

	const baseClasses = 'flex flex-col';
	const mergedClasses = cn(baseClasses, className);
</script>

<div class={mergedClasses} {...restProps}>
	{#each songs as song}
		<Track format="list" {song} />
	{/each}
</div>
