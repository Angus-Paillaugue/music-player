<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		type?: string;
		class?: string;
		value?: string;
	}

	let { type = 'text', class: className, value = $bindable(''), ...restProps }: Props = $props();

	const baseClasses =
		'rounded-lg px-4 py-2 text-sm font-normal text-foreground bg-secondary text-base outline-none focus:outline-none focus:ring-2 transition-all';
</script>

<input bind:value {type} class={cn(baseClasses, className)} {...restProps} />
