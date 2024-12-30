<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		children?: () => any;
		class?: string;
	}
	let { children, class: className, ...restProps }: Props = $props();
	const baseClasses =
		'w-fit inline-block hover:underline focus:rounded focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50 disabled:cursor-not-allowed disabled:opacity-50';

</script>

<a class={cn(baseClasses, className)} {...restProps}>
	{@render children?.()}
</a>
