<script lang="ts">
	import { fly } from 'svelte/transition';
	import { docs } from '$lib/docs';
	import ProseDoc from '$lib/components/ProseDoc.svelte';
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
		<ProseDoc>
			{@html docs.hub.html}
		</ProseDoc>
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
		<section
			class="border border-dashed border-border rounded-xl p-6 text-sm text-muted-foreground"
		>
			No docs published yet. Add <code>docs/index.md</code> to the website repo for this page, and
			<code>docs/0_name.md</code> files to any source repo to fill the sidebar.
		</section>
	{/if}
</article>
