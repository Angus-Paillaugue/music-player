<script lang="ts">
	import { cn } from "$lib/utils";
	import { LoaderCircle } from "lucide-svelte";

  interface Props {
    children?: () => any;
    class?: string;
    loading?: boolean;
  }
  let { children, class:className, loading, ...restProps }: Props = $props();
  const baseClasses = "bg-primary w-fit rounded-lg px-4 py-2 flex flex-row items-center gap-4 text-sm font-medium text-background";
</script>

<button class={cn(baseClasses, className)} {...restProps}>
  {#if loading}
    <LoaderCircle class="size-4 animate-spin" />
  {/if}
  {@render children?.()}
</button>
