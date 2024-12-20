<script lang="ts">
	import { X } from "lucide-svelte";
	import { fade, fly } from "svelte/transition";

  interface Props {
    open: boolean;
    children?: () => any;
  }
  let { open = $bindable(false), children }: Props = $props();
</script>

<svelte:window onkeydown={(e) => {if(e.key === "Escape"){open = false}}} />

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="fixed inset-0 bg-background/50 backdrop-blur-md z-50" transition:fade={{ duration: 300 }} onclick={() => (open = false)}></div>

  <div class="fixed inset-0 flex justify-center items-center z-50">
    <div class="bg-background max-w-screen-md border w-full rounded-lg relative p-4" transition:fly={{ duration: 300, y:'100%' }}>
      <button class="p-1 absolute top-2 right-2 rounded-md hover:bg-secondary" onclick={() => (open = false)}><X class="size-4" /></button>
      {@render children?.()}
    </div>
  </div>
{/if}
