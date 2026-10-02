<script lang="ts">
	import type { ComponentType, Snippet, SvelteComponent } from 'svelte';
	import type { IconProps } from 'lucide-svelte';
	import { cn } from '$lib/cn';

	let {
		open,
		onclose,
		title,
		icon: Icon,
		class: className,
		children,
	}: {
		open: boolean;
		onclose: () => void;
		title: string;
		icon: ComponentType<SvelteComponent<IconProps>>;
		class?: string;
		children: Snippet;
	} = $props();

	const id = $props.id();
	let dialog: HTMLDialogElement;

	$effect(() => {
		if (open) dialog.showModal();
		else dialog.close();
	});
</script>

<dialog
	bind:this={dialog}
	onclick={(event) => event.target === dialog && onclose()}
	{onclose}
	aria-labelledby="{id}-title"
	class={cn(
		'm-auto w-[calc(100%-2rem)] rounded-[1.5rem] border border-border bg-card p-6 text-card-foreground shadow-lg backdrop:bg-background/80 backdrop:backdrop-blur-sm sm:p-8',
		className
	)}
>
	<div class="mb-6 flex items-center gap-3">
		<div class="flex size-10 items-center justify-center rounded-full bg-muted">
			<Icon size={20} class="text-foreground" />
		</div>
		<h2 id="{id}-title" class="text-xl font-semibold">{title}</h2>
	</div>
	{@render children()}
</dialog>

<style>
	dialog {
		opacity: 0;
		transform: scale(0.95);
		transition:
			opacity 200ms ease-out,
			transform 200ms ease-out,
			overlay 200ms ease-out allow-discrete,
			display 200ms ease-out allow-discrete;
	}
	dialog[open] {
		opacity: 1;
		transform: none;
	}
	@starting-style {
		dialog[open] {
			opacity: 0;
			transform: scale(0.95);
		}
	}
</style>
