<script lang="ts">
	import { X } from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';

	interface Props {
		open: boolean;
		children?: () => any;
	}
	let { open = $bindable(false), children }: Props = $props();
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			open = false;
		}
	}}
/>

{#if open}
	<!-- Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 bg-background/50 backdrop-blur-md"
		transition:fade={{ duration: 300 }}
		onclick={() => (open = false)}
	></div>

	<div
		class="fixed left-1/2 top-1/2 z-50 w-full max-w-screen-md -translate-x-1/2 -translate-y-1/2 p-2"
		transition:fly={{ duration: 300, y: '100%' }}
	>
		<div class="rounded-lg border bg-background p-4">
			<div class="relative w-full">
				<button
					class="absolute right-2 top-2 rounded-md p-1 hover:bg-secondary"
					onclick={() => (open = false)}><X class="size-4" /></button
				>
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}
