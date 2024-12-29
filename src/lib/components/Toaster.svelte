<script lang="ts">
  import { toasts, toast, type ToastType } from '$lib/stores';
  import { fly, slide } from 'svelte/transition';
  import { cn } from '$lib/utils';
  import { Info, TriangleAlert, CheckCheck, X } from 'lucide-svelte';
  import Button from './Button.svelte';
	import { flip } from 'svelte/animate';

  const baseClasses = 'flex grow flex-row items-center gap-2 transition-all p-4 border rounded-lg bg-secondary';
  const variantClasses = new Map([
    ['info', 'border-blue-600/50'],
    ['error', 'border-destructive/50'],
    ['success', 'border-emerald-600/50']
  ]);

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
      class={cn(baseClasses, variantClasses.get(t.type))}
      animate:flip
      transition:fly={{ duration: 300, x: '100%' }}
    >
      {@render icon(t.type)}
      <span class="grow">{t.message}</span>
      <Button
        variant={["icon", "secondary"]}
        class="shrink-0"
        onclick={() => toast.remove(t.id)}
      >
        <X class="size-full" />
      </Button>
    </div>
  {/each}
</div>
