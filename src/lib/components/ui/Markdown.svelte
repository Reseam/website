<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import { renderMarkdown } from '#lib/markdown.ts';

	let { text, class: className }: { text: string; class?: ClassValue } = $props();

	const html = $derived(renderMarkdown(text));
</script>

<div class={['markdown', className]}>{@html html}</div>

<style>
	.markdown {
		display: grid;
		gap: 0.75em;
		overflow-wrap: anywhere;
	}
	.markdown :global(:where(ul, ol)) {
		display: grid;
		gap: 0.25em;
		padding-left: 1.25em;
	}
	.markdown :global(ul) {
		list-style: disc;
	}
	.markdown :global(ol) {
		list-style: decimal;
	}
	.markdown :global(a) {
		color: var(--color-primary);
	}
	.markdown :global(a:hover) {
		text-decoration: underline;
	}
	.markdown :global(code) {
		border-radius: var(--radius-xs);
		background: var(--color-surface-container-high);
		padding: 0.1em 0.35em;
		font-family: var(--font-mono);
		font-size: 0.9em;
	}
	.markdown :global(pre) {
		overflow-x: auto;
		border-radius: var(--radius-sm);
		background: var(--color-surface-container-high);
		padding: 0.75em 1em;
	}
	.markdown :global(pre code) {
		background: none;
		padding: 0;
	}
	.markdown :global(blockquote) {
		border-left: 2px solid var(--color-outline-variant);
		padding-left: 0.75em;
		color: var(--color-on-surface-variant);
	}
</style>
