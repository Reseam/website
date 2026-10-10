<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import { Dialog } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import { buttonClass } from './button';

	let {
		open = $bindable(false),
		title,
		description,
		children,
		footer,
	}: {
		open?: boolean;
		title: string;
		description?: string;
		children: Snippet;
		footer?: Snippet;
	} = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay
			class="fixed inset-0 z-50 bg-scrim backdrop-blur-sm transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0"
		/>
		<Dialog.Content
			class="fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[min(28rem,calc(100vw-2rem))] -translate-1/2 gap-5 overflow-y-auto rounded-xl border border-outline-variant bg-surface-container-low p-6 shadow-elevation-3 transition-[opacity,scale] duration-200 ease-emphasized data-starting-style:scale-96 data-starting-style:opacity-0 data-ending-style:scale-96 data-ending-style:opacity-0"
		>
			<header class="flex items-start justify-between gap-4">
				<div class="grid gap-1.5">
					<Dialog.Title level={2} class="text-title-large">{title}</Dialog.Title>
					{#if description}
						<Dialog.Description class="text-body-medium text-on-surface-variant"
							>{description}</Dialog.Description
						>
					{/if}
				</div>
				<Dialog.Close class="-mt-1.5 -mr-2 {buttonClass('ghost', 'icon')}" aria-label="Close">
					<X size={18} />
				</Dialog.Close>
			</header>
			{@render children()}
			{#if footer}
				<footer class="flex flex-wrap items-center justify-end gap-2 pt-1">
					{@render footer()}
				</footer>
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
