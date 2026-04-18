<script lang="ts">
	import { fly } from 'svelte/transition';
	import { ArrowLeft, ArrowRight, Pencil } from 'lucide-svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.page.title} · Reseam Docs</title>
	{#if data.page.description}
		<meta name="description" content={data.page.description} />
	{/if}
</svelte:head>

<article in:fly={{ y: 10, duration: 400 }}>
	<p class="text-xs uppercase tracking-wider text-muted-foreground mb-3">
		{data.page.sourceLabel}
	</p>
	<h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-6">{data.page.title}</h1>

	<div class="prose-doc">
		{@html data.page.html}
	</div>

	<div class="mt-12 pt-6 border-t border-border flex items-center justify-between text-sm">
		<a
			href={data.page.editUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
		>
			<Pencil size={14} /> Edit this page
		</a>
	</div>

	{#if data.prev || data.next}
		<nav class="mt-6 grid grid-cols-2 gap-3">
			{#if data.prev}
				<a
					href="/docs/{data.prev.slug}/"
					class="border border-border rounded-xl p-4 hover:border-primary/50 hover:bg-muted transition-colors"
				>
					<span class="inline-flex items-center gap-1 text-xs text-muted-foreground">
						<ArrowLeft size={12} /> Previous
					</span>
					<span class="block font-medium mt-1">{data.prev.title}</span>
				</a>
			{:else}
				<span></span>
			{/if}
			{#if data.next}
				<a
					href="/docs/{data.next.slug}/"
					class="border border-border rounded-xl p-4 hover:border-primary/50 hover:bg-muted transition-colors text-right"
				>
					<span class="inline-flex items-center gap-1 text-xs text-muted-foreground">
						Next <ArrowRight size={12} />
					</span>
					<span class="block font-medium mt-1">{data.next.title}</span>
				</a>
			{/if}
		</nav>
	{/if}
</article>

<style>
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
