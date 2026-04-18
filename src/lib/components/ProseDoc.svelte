<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="prose-doc">
	{@render children()}
</div>

<style>
	.prose-doc :global(h1) {
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		margin-bottom: 1rem;
	}
	.prose-doc :global(h2) {
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 2.5rem;
		margin-bottom: 1rem;
		letter-spacing: -0.01em;
	}
	.prose-doc :global(h3) {
		font-size: 1.15rem;
		font-weight: 600;
		margin-top: 2rem;
		margin-bottom: 0.75rem;
	}
	.prose-doc :global(p) {
		color: var(--muted-foreground);
		line-height: 1.7;
		margin-bottom: 1rem;
	}
	.prose-doc :global(ul),
	.prose-doc :global(ol) {
		color: var(--muted-foreground);
		padding-left: 1.25rem;
		margin-bottom: 1rem;
	}
	.prose-doc :global(ul) {
		list-style: disc;
	}
	.prose-doc :global(ol) {
		list-style: decimal;
	}
	.prose-doc :global(li) {
		margin-bottom: 0.35rem;
	}
	.prose-doc :global(a) {
		color: var(--primary);
		text-decoration: underline;
		text-underline-offset: 2px;
	}
	.prose-doc :global(code) {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.875em;
		background: var(--muted);
		padding: 0.1em 0.35em;
		border-radius: 0.35rem;
	}
	.prose-doc :global(pre) {
		background: var(--muted);
		border: 1px solid var(--border);
		border-radius: 0.75rem;
		padding: 1rem;
		overflow-x: auto;
		margin: 1rem 0;
		font-size: 0.85rem;
	}
	.prose-doc :global(pre code) {
		background: transparent;
		padding: 0;
		border-radius: 0;
	}
	.prose-doc :global(blockquote) {
		border-left: 2px solid var(--border);
		padding-left: 1rem;
		color: var(--muted-foreground);
		margin: 1rem 0;
	}
	.prose-doc :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 1rem 0;
		font-size: 0.9rem;
	}
	.prose-doc :global(th),
	.prose-doc :global(td) {
		border: 1px solid var(--border);
		padding: 0.5rem 0.75rem;
		text-align: left;
	}
	.prose-doc :global(th) {
		background: var(--muted);
		font-weight: 600;
	}
	.prose-doc :global(strong) {
		color: var(--foreground);
		font-weight: 600;
	}
	.prose-doc :global(hr) {
		border: 0;
		border-top: 1px solid var(--border);
		margin: 2rem 0;
	}
</style>
