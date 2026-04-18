<script lang="ts">
	import { fly } from 'svelte/transition';
	import { docs } from '$lib/docs';
</script>

<svelte:head>
	<title>{docs.hub?.title ?? 'Docs'} · Reseam</title>
	<meta
		name="description"
		content={docs.hub?.description ??
			"Reseam documentation — engine, API, and patches, pulled from each repo's docs folder."}
	/>
</svelte:head>

<article in:fly={{ y: 10, duration: 400 }}>
	{#if docs.hub}
		<div class="prose-doc">
			{@html docs.hub.html}
		</div>
	{/if}

	{#if docs.groups.length > 0}
		<section class={docs.hub ? 'space-y-8 mt-12' : 'space-y-8'}>
			{#each docs.groups as group (group.slug)}
				<div>
					<h2 class="text-xl font-semibold mb-3">{group.label}</h2>
					<ul class="grid sm:grid-cols-2 gap-3">
						{#each group.sections as section (section.key)}
							{#each section.pages as item (item.slug)}
								<li>
									<a
										href="/docs/{item.slug}/"
										class="block border border-border rounded-xl p-4 hover:border-primary/50 hover:bg-muted transition-colors"
									>
										<span class="block font-medium text-foreground">{item.title}</span>
										{#if item.description}
											<span class="block text-sm text-muted-foreground mt-1 line-clamp-2">
												{item.description}
											</span>
										{/if}
									</a>
								</li>
							{/each}
						{/each}
					</ul>
				</div>
			{/each}
		</section>
	{:else if !docs.hub}
		<section class="border border-dashed border-border rounded-xl p-6 text-sm text-muted-foreground">
			No docs published yet. Add <code>docs/index.md</code> to the website repo for this page,
			and <code>docs/0_name.md</code> files to any source repo to fill the sidebar.
		</section>
	{/if}
</article>

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
	.prose-doc :global(strong) {
		color: var(--foreground);
		font-weight: 600;
	}
</style>
