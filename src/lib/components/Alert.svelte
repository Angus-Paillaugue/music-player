<script lang="ts">
	import { cn } from '$lib/utils';
	import { TriangleAlert } from 'lucide-svelte';
	interface Props {
		children?: () => any;
		class?: string;
	}

	let { children, class: className, ...restProps }: Props = $props();
</script>

<div
	class={cn(
		'flex flex-row items-center gap-4 rounded-lg border border-destructive bg-secondary p-4 text-foreground',
		className
	)}
	role="alert"
	{...restProps}
>
	<TriangleAlert class="size-6 text-destructive" />
	{@render children?.()}
</div>
