<script lang="ts">
	import { fly } from 'svelte/transition';
	import { ArrowLeft, ArrowRight, Pencil } from 'lucide-svelte';
	import ProseDoc from '$lib/components/ProseDoc.svelte';

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

	<ProseDoc>
		{@html data.page.html}
	</ProseDoc>

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
