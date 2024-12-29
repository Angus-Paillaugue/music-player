<script lang="ts">
	import { cn } from "$lib/utils";

  interface Props {
    value: string;
    class?: string;
    children: () => any;
  }

  let { value = $bindable(), class: className, children, ...restProps }: Props = $props();

  const baseClasses = 'rounded-lg px-2 py-2 text-sm font-normal text-foreground bg-secondary text-base outline-none focus:outline-none focus:ring-2 transition-all';
  const mergedClasses = cn(baseClasses, className);
</script>

<select bind:value class={mergedClasses} {...restProps}>
  {@render children()}
</select>
