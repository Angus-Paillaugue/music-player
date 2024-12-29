<script lang="ts">
	import type { Song } from "$lib/types";
	import { cn } from "$lib/utils";
	import { onMount } from "svelte";
	import Track from "./Track.svelte";

  interface Props {
    songs: Song[];
    class?: string;
    rows?: number;
    cols?: number;
  }

  let { songs, class: className, rows = 2, cols = 3 }: Props = $props();
  const GRID_SIZE = rows * cols;
  let currentPage = $state(0);
  let carouselElement: HTMLElement;
  let dragStartPos = $state(-1);
  let numberOfPages = $derived(Math.ceil(songs.length / GRID_SIZE));

  function setCurrentPage() {
    currentPage = Math.round(carouselElement.scrollLeft / carouselElement.clientWidth);
  }

  export function scrollToPage(number: number) {
    carouselElement.scrollTo({ left: carouselElement.clientWidth * number, behavior: 'smooth' });
  }

  export function nextPage() {
    scrollToPage(currentPage + 1 % numberOfPages);
  }

  export function prevPage() {
    scrollToPage(currentPage - 1 % numberOfPages);
  }

  function onDragStart(e: MouseEvent) {
    // Prevent drag triggering a button click
    dragStartPos = carouselElement.scrollLeft + e.clientX;
    carouselElement.classList.remove('snap-x');
  }

  function onDragMove(e: MouseEvent) {
    if(dragStartPos === -1) return;
    carouselElement.scrollTo({ left: dragStartPos - e.clientX, behavior: 'instant' });
    const target = e.target as HTMLElement;
    target.closest('.track')?.classList.add('disabled');
  }

  function onDragEnd(e: MouseEvent) {
    if(dragStartPos === -1 || !carouselElement) return;
    const target = e.target as HTMLElement;
    const page = Math.round(carouselElement.scrollLeft / carouselElement.clientWidth);
    scrollToPage(page);
    dragStartPos = -1;
    carouselElement.classList.add('snap-x');
    target.closest('.track')?.classList.remove('disabled');
  }

  onMount(() => {
    carouselElement.scrollTo({ left: 0, behavior: 'smooth' });

    carouselElement.addEventListener('mousedown', onDragStart);
    carouselElement.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);

    return () => {
      carouselElement.removeEventListener('mousedown', onDragStart);
      carouselElement.removeEventListener('mousemove', onDragMove);
      carouselElement.removeEventListener('mouseup', onDragEnd);
    };
  });
</script>

<div class={cn("w-full overflow-hidden relative pb-7", className)}>
  <div class='w-full flex flex-row overflow-x-auto snap-x snap-mandatory no-scrollbar select-none' onscroll={setCurrentPage} bind:this={carouselElement}>
    {#each new Array(numberOfPages) as _, pageNumber}
      <div class="grid grid-cols-3 grid-rows-2 w-full shrink-0 snap-start">
        {#each songs.slice(pageNumber * GRID_SIZE, (pageNumber + 1) * GRID_SIZE) as song}
          <Track format="card" {song} />
        {/each}
      </div>
    {/each}

  </div>
  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 flex-row">
    {#each new Array(numberOfPages) as _, pageNumber}
      <button class={cn("size-3 rounded-full transition-colors", pageNumber === currentPage ? 'bg-foreground' : 'bg-muted')} aria-label="Go to page {pageNumber}" disabled={pageNumber === currentPage} onclick={() => scrollToPage(pageNumber)}> </button>
    {/each}
  </div>
</div>
