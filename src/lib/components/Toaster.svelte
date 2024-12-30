<script lang="ts">
  import { toasts, toast, type ToastType } from '$lib/stores';
  import { fly } from 'svelte/transition';
  import { cn } from '$lib/utils';
  import { Info, TriangleAlert, CheckCheck, X } from 'lucide-svelte';
  import Button from './Button.svelte';
	import { flip } from 'svelte/animate';

  const baseClasses = 'flex grow flex-row items-center gap-2 w-full transition-all p-4 rounded-lg bg-secondary';

  const iconVariants = new Map([
    ['info', 'text-blue-600'],
    ['error', 'text-destructive'],
    ['success', 'text-emerald-600']
  ]);
</script>

{#snippet icon(type: ToastType)}
  {@const classes = cn('size-5', iconVariants.get(type))}
  {#if type === 'info'}
    <Info class={classes} />
  {:else if type === 'error'}
    <TriangleAlert class={classes} />
  {:else if type === 'success'}
    <CheckCheck class={classes} />
  {/if}
{/snippet}

<div class="flex flex-col gap-2 fixed bottom-2 right-2 z-30 max-w-[400px]">
  {#each $toasts as t (t.id)}
    <div
      role="alert"
      class={baseClasses}
      animate:flip={{ duration: 500 }}
      transition:fly={{ duration: 250, x: '100%' }}
    >
      {@render icon(t.type)}
      <span class="grow text-sm">{t.message}</span>
      <Button
        variant={["icon", "secondary"]}
        class="shrink-0 hover:bg-background rounded-full p-1 size-7"
        onclick={() => toast.remove(t.id)}
      >
        <X class="size-full" />
      </Button>
    </div>
  {/each}
</div>
