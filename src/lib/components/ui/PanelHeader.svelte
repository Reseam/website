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
		primary: 'bg-primary/15 text-primary',
		error: 'bg-error/15 text-error',
		muted: 'bg-muted text-muted-foreground',
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
		<h2 {id} class="truncate text-lg font-semibold tracking-tight">{title}</h2>
		{#if subtitle}<p class="text-sm text-muted-foreground">{subtitle}</p>{/if}
	</div>
	{@render aside?.()}
</header>
