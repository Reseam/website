<script lang="ts">
	import type { Snippet } from 'svelte';

	let { class: className, children }: { class?: string; children: Snippet } = $props();
</script>

<div class={['border-t border-border px-5 py-5 first:border-t-0 sm:px-6', className]}>
	{@render children()}
</div>
