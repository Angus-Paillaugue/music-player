<script lang="ts">
	import { cn } from "$lib/utils";

  interface Props {
    type?: string;
    class?: string;
  }

  let { type="text", class:className, ...restProps }: Props = $props();


  const baseClasses = "rounded-lg px-4 py-2 text-sm font-normal text-primary bg-secondary text-base outline-none focus:outline-none focus:ring-2 transition-all";
</script>

<input {type} class={cn(baseClasses, className)} {...restProps} />
