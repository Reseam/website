<script lang="ts">
	import type { ComponentType, Snippet, SvelteComponent } from 'svelte';
	import type { IconProps } from 'lucide-svelte';
	import { cn } from '$lib/cn';

	let {
		icon: Icon,
		tone,
		title,
		class: className,
		children,
	}: {
		icon: ComponentType<SvelteComponent<IconProps>>;
		tone: 'primary' | 'warning';
		title?: string;
		class?: string;
		children: Snippet;
	} = $props();
</script>

<div
	class={cn(
		'flex gap-3 rounded-[1rem] border border-border bg-background/60 p-4 text-sm',
		className
	)}
>
	<Icon
		size={18}
		class={cn('mt-0.5 shrink-0', tone === 'primary' ? 'text-primary' : 'text-amber-500')}
	/>
	<div class="min-w-0 flex-1">
		{#if title}<p class="font-medium">{title}</p>{/if}
		{@render children()}
	</div>
</div>
