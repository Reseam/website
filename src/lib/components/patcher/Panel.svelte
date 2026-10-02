<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/cn';

	let {
		labelledby,
		class: className,
		children,
	}: { labelledby?: string; class?: string; children: Snippet } = $props();
</script>

<section
	aria-labelledby={labelledby}
	class={cn('rounded-[1.25rem] border border-border bg-card', className)}
>
	{@render children()}
</section>
