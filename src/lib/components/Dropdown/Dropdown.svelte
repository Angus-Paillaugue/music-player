<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import { cn } from '$lib/utils';
	import type { SvelteHTMLElements } from 'svelte/elements';

	export function accordion(node: HTMLElement, isOpen: boolean) {
		node.style.overflow = 'hidden';
		node.style.height = isOpen ? 'auto' : '0';
		node.classList.add('accordion');
		return {
			update(isOpen: boolean) {
				let animation = node.animate(
					[
						{
							height: node.scrollHeight + 'px'
						},
						{
							height: 0
						}
					],
					{ duration: Math.max(node.scrollHeight, 150), fill: 'both' }
				);
				animation.pause();
				if (!isOpen) {
					animation.play();
				} else {
					animation.reverse();
				}
				// Used for nested accordions
				animation.onfinish = () => {
					animation.cancel();
					node.style.height = isOpen ? 'auto' : '0';
				};
			}
		};
	}

	interface Props {
		open?: boolean;
		items: Snippet<[]>;
		position?: 'top' | 'bottom' | 'left' | 'right';
		align?: 'start' | 'center' | 'end';
	}

	let {
		open = $bindable(false),
		children,
		items,
		position = 'bottom',
		align = 'center',
		class: className,
		...restProps
	}: Props & SvelteHTMLElements['div'] = $props();

	/**
	 * Toggles the state of the dropdown.
	 */
	const toggle = () => (open = !open);

	function onWindowClickHandler(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.dropdown')) open = false;
	}

	function onWindowKeydownHandler(event: KeyboardEvent) {
		if (event.key === 'Escape') open = false;
	}

	/**
	 * Sets the tab index for the dropdown component.
	 */
	function setTabIndex() {
		const newTabIndex = open ? 0 : -1;
		const dropdown = document.querySelector('.dropdown');
		if (!dropdown) return;
		const listElements = dropdown.querySelectorAll('.dropdown-item');
		listElements.forEach((el) => {
			el.setAttribute('tabindex', String(newTabIndex));
		});
	}

	// Set the context for the trigger to be able to toggle the dropdown
	setContext('dropdown', { open, toggle });

	// Set the tab index for the dropdown items
	$effect(setTabIndex);

	// Position classes for the dropdown
	const positionClasses = {
		top: {
			pos: 'bottom-full mb-2',
			align: {
				start: 'left-0',
				center: 'left-1/2 -translate-x-1/2',
				end: 'right-0'
			}
		},
		bottom: {
			pos: 'top-full mt-2',
			align: {
				start: 'left-0',
				center: 'left-1/2 -translate-x-1/2',
				end: 'right-0'
			}
		},
		left: {
			pos: 'right-full mr-2',
			align: {
				start: 'top-0',
				center: 'top-1/2 -translate-y-1/2',
				end: 'bottom-0'
			}
		},
		right: {
			pos: 'left-full ml-2',
			align: {
				start: 'top-0',
				center: 'top-1/2 -translate-y-1/2',
				end: 'bottom-0'
			}
		}
	};
</script>

<svelte:window onclick={onWindowClickHandler} onkeydown={onWindowKeydownHandler} />

<div class={cn('dropdown relative w-fit', className)} {...restProps}>
	{@render children?.()}

	<div
		class={cn(
			'absolute z-30 w-52 overflow-hidden rounded-lg border border-border bg-background shadow',
			positionClasses[position].pos,
			positionClasses[position].align[align]
		)}
		use:accordion={open}
	>
		<div class="flex flex-col">
			{@render items?.()}
		</div>
	</div>
</div>
