<script lang="ts">
	import type { ComponentType, Snippet, SvelteComponent } from 'svelte';
	import type { IconProps } from 'lucide-svelte';
	import { cn } from '$lib/cn';

	let {
		id,
		icon: Icon,
		tone = 'muted',
		spinning = false,
		title,
		subtitle,
		actions,
	}: {
		id?: string;
		icon: ComponentType<SvelteComponent<IconProps>>;
		tone?: 'muted' | 'primary' | 'error';
		spinning?: boolean;
		title: string;
		subtitle?: string;
		actions?: Snippet;
	} = $props();

	const tones = {
		muted: 'bg-muted text-muted-foreground',
		primary: 'bg-primary/15 text-primary',
		error: 'bg-error/15 text-error',
	};
</script>

<div class="flex items-center gap-4 px-5 py-5 sm:px-6">
	<div
		class={cn('flex size-11 shrink-0 items-center justify-center rounded-[0.875rem]', tones[tone])}
	>
		<Icon size={22} class={spinning ? 'animate-spin' : undefined} />
	</div>
	<div class="min-w-0 flex-1">
		<h2 {id} class="truncate text-lg font-semibold leading-tight">{title}</h2>
		{#if subtitle}
			<p class="mt-0.5 line-clamp-2 break-words text-sm text-muted-foreground">{subtitle}</p>
		{/if}
	</div>
	{#if actions}
		<div class="flex shrink-0 items-center gap-2">{@render actions()}</div>
	{/if}
</div>
