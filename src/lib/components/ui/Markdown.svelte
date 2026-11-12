<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import { renderMarkdown } from '#lib/markdown.ts';

	let {
		text,
		render = renderMarkdown,
		class: className,
	}: { text: string; render?: (text: string) => string; class?: ClassValue } = $props();

	const html = $derived(render(text));
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
	.markdown :global(:where(h3, h4, h5, h6)) {
		margin-top: 0.5em;
		font-weight: 600;
		line-height: 1.3;
	}
	.markdown :global(h3) {
		font-size: 1.25em;
	}
	.markdown :global(h4) {
		font-size: 1.1em;
	}
	.markdown :global(table) {
		display: block;
		overflow-x: auto;
		border-collapse: collapse;
	}
	.markdown :global(:where(th, td)) {
		overflow-wrap: break-word;
		border: 1px solid var(--color-outline-variant);
		padding: 0.4em 0.75em;
		text-align: left;
	}
	.markdown :global(hr) {
		border-color: var(--color-outline-variant);
	}
	.markdown :global(blockquote) {
		border-left: 2px solid var(--color-outline-variant);
		padding-left: 0.75em;
		color: var(--color-on-surface-variant);
	}
</style>
