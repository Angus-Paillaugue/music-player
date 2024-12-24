<script lang="ts">
	import type { Song } from '$lib/types';
	import { cn } from '$lib/utils';
	import { fade } from 'svelte/transition';

	interface Props {
		song: Song;
		isPlaying?: boolean;
		isSelected?: boolean;
		class?: string;
	}

	let {
		song,
		isPlaying = false,
		isSelected = false,
		class: className,
		...restProps
	}: Props = $props();
</script>

<div class={cn('relative size-full overflow-hidden', className)} {...restProps}>
	<!-- Loader -->
	<div class="absolute inset-0 -z-10 animate-pulse bg-secondary"></div>

	<!-- Actual image -->
	<img src={song.coverPath} class="size-full object-cover" alt="" />

	<!-- Playing indicator : moving audio lines -->
	{#if isSelected}
		<div
			class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm @container"
			transition:fade={{ duration: 300, delay: 0 }}
		>
			{#if isPlaying}
				<!-- For covers <= 100px wide -->
				<div
					class="flex size-full flex-row items-center justify-around gap-[2px] p-2 @[100px]:hidden"
					transition:fade={{ duration: 300, delay: 0 }}
				>
					<div
						class="w-[3px] rounded-full bg-primary"
						style="animation: height-animation 1.5s 0.5s ease-in-out infinite both;"
					></div>
					<div
						class="w-[3px] rounded-full bg-primary"
						style="animation: height-animation 1.8s 0.8s ease-in-out infinite both;"
					></div>
					<div
						class="w-[3px] rounded-full bg-primary"
						style="animation: height-animation 2s 1s ease-in-out infinite both;"
					></div>
					<div
						class="w-[3px] rounded-full bg-primary"
						style="animation: height-animation 1.6s 0.6s ease-in-out infinite both;"
					></div>
				</div>

				<!-- For covers > 100px wide -->
				<div
					class="hidden size-full flex-row items-center justify-around gap-[2px] p-12 @[100px]:flex"
					transition:fade={{ duration: 300, delay: 0 }}
				>
					<div
						class="w-[10px] rounded-full bg-primary"
						style="animation: height-animation 1.5s 0.5s ease-in-out infinite both;"
					></div>
					<div
						class="w-[10px] rounded-full bg-primary"
						style="animation: height-animation 1.8s 0.8s ease-in-out infinite both;"
					></div>
					<div
						class="w-[10px] rounded-full bg-primary"
						style="animation: height-animation 2s 1s ease-in-out infinite both;"
					></div>
					<div
						class="w-[10px] rounded-full bg-primary"
						style="animation: height-animation 1.6s 0.6s ease-in-out infinite both;"
					></div>
					<div
						class="w-[10px] rounded-full bg-primary"
						style="animation: height-animation 1.4s 0.4s ease-in-out infinite both;"
					></div>
					<div
						class="w-[10px] rounded-full bg-primary"
						style="animation: height-animation 1.7s 0.7s ease-in-out infinite both;"
					></div>
					<div
						class="w-[10px] rounded-full bg-primary"
						style="animation: height-animation 1.9s 0.9s ease-in-out infinite both;"
					></div>
					<div
						class="w-[10px] rounded-full bg-primary"
						style="animation: height-animation 1.3s 0.3s ease-in-out infinite both;"
					></div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	@keyframes -global-height-animation {
		0%,
		100% {
			height: 0;
		}
		50% {
			height: 100%;
		}
	}
</style>
