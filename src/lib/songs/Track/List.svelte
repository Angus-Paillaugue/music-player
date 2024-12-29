<script lang="ts">
	import type { Song } from "$lib/types";
	import { cn } from "$lib/utils";
	import Track from "./Track.svelte";

  interface Props {
    songs: Song[];
    class?: string;
  }

  let { songs, class: className }: Props = $props();

  const baseClasses = 'flex flex-col';
  const mergedClasses = cn(baseClasses, className);
</script>

<div class={mergedClasses}>
  {#each songs as song}
    <Track format="list" {song} />
  {/each}
</div>
