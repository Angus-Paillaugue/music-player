<script lang="ts">
	import { cn } from '$lib/utils';
	import type { SvelteHTMLElements } from 'svelte/elements';

	type Props = ({ href: string } & SvelteHTMLElements['a']) | SvelteHTMLElements['button'];

	const { children, class: className, ...restProps }: Props = $props();

	const classes = cn(
		'list-none py-2 font-medium transition-colors text-base px-4 flex flex-row items-center gap-2 hover:bg-secondary/50 -outline-offset-1 dropdown-item',
		className
	);
</script>

{#if 'href' in restProps}
	<a class={classes} {...restProps}>
		{@render children?.()}
	</a>
{:else}
	<button class={classes} {...restProps}>
		{@render children?.()}
	</button>
{/if}
