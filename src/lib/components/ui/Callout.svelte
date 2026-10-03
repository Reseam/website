<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	type Tone = 'primary' | 'warning' | 'error';

	let {
		icon: Icon,
		tone = 'primary',
		title,
		class: className,
		children,
	}: {
		icon: Component<{ size?: number; class?: string }>;
		tone?: Tone;
		title?: string;
		class?: string;
		children: Snippet;
	} = $props();

	const tones: Record<Tone, string> = {
		primary: 'border-primary/25 bg-primary/5 [--tone:var(--color-primary)]',
		warning: 'border-warning/30 bg-warning/5 [--tone:var(--color-warning)]',
		error: 'border-error/30 bg-error/5 [--tone:var(--color-error)]',
	};
</script>

<div class={['flex gap-3 rounded-lg border px-4 py-3.5 text-sm', tones[tone], className]}>
	<Icon size={18} class="mt-px shrink-0 text-(--tone)" />
	<div class="min-w-0 flex-1">
		{#if title}<p class="font-medium">{title}</p>{/if}
		{@render children()}
	</div>
</div>
