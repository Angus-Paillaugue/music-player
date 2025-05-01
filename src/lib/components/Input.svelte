<script lang="ts">
	import { cn } from '$lib/utils';
	import type { SvelteHTMLElements } from 'svelte/elements';

	let {
		type = 'text',
		class: className,
		value = $bindable(''),
		...restProps
	}: SvelteHTMLElements['input'] = $props();

	let inputElement: HTMLInputElement;

	const baseClasses =
		'rounded-lg px-4 py-2 text-sm font-normal text-foreground bg-secondary text-base outline-none focus:outline-none focus:ring-2 transition-all';

	export function focus() {
		inputElement.focus();
	}
</script>

<input
	bind:value
	bind:this={inputElement}
	{type}
	class={cn(baseClasses, className)}
	{...restProps}
/>
