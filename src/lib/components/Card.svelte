<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/cn';

	let {
		class: className,
		children,
	}: {
		class?: string;
		children?: Snippet;
	} = $props();
</script>

<div
	class={cn(
		'rounded-[var(--radius)] border border-border bg-card text-card-foreground shadow-sm',
		className
	)}
>
	{@render children?.()}
</div>
