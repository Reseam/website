<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/cn';

	let { class: className, children }: { class?: string; children: Snippet } = $props();
</script>

<div class={cn('border-t border-border px-5 py-5 sm:px-6', className)}>
	{@render children()}
</div>
