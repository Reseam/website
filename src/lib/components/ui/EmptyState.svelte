<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	let {
		icon: Icon,
		children,
	}: { icon?: Component<{ size?: number; class?: string }>; children: Snippet } = $props();
</script>

<div
	class="grid justify-items-center gap-3 rounded-xl border border-dashed border-outline-variant px-6 py-16 text-center text-on-surface-variant"
>
	{#if Icon}<Icon size={28} class="opacity-40" />{/if}
	{@render children()}
</div>
