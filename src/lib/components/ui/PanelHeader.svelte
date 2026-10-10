<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	type Tone = 'primary' | 'error' | 'muted';

	let {
		id,
		title,
		subtitle,
		icon: Icon,
		tile,
		tone = 'primary',
		spinning = false,
		aside,
	}: {
		id?: string;
		title: string;
		subtitle?: string;
		icon?: Component<{ size?: number; class?: string }>;
		tile?: Snippet;
		tone?: Tone;
		spinning?: boolean;
		aside?: Snippet;
	} = $props();

	const tones: Record<Tone, string> = {
		primary: 'bg-secondary-container text-primary',
		error: 'bg-error-container text-error',
		muted: 'bg-surface-container text-on-surface-variant',
	};
</script>

<header class="flex items-center gap-4 px-5 py-5 sm:px-6">
	<span class={['grid size-11 shrink-0 place-items-center rounded-md', tones[tone]]}>
		{#if tile}{@render tile()}{:else if Icon}<Icon
				size={20}
				class={spinning ? 'animate-spin' : undefined}
			/>{/if}
	</span>
	<div class="min-w-0 flex-1">
		<h2 {id} class="truncate text-title-large">{title}</h2>
		{#if subtitle}<p class="text-body-medium text-on-surface-variant">{subtitle}</p>{/if}
	</div>
	{@render aside?.()}
</header>
