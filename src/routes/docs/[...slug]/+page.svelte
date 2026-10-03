<script lang="ts">
	import Pencil from '@lucide/svelte/icons/pencil';
	import DocContent from '#lib/components/docs/DocContent.svelte';
	import PageNav from '#lib/components/docs/PageNav.svelte';
	import Toc from '#lib/components/docs/Toc.svelte';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';

	let { data } = $props();
	const page = $derived(data.page);
	const group = $derived(data.groups.find(({ slug }) => slug === page.source));
</script>

<PageMeta
	title="{page.title} · {group?.label ?? 'Docs'} · Reseam"
	description={page.description ?? group?.summary ?? page.title}
	type="article"
/>

<div class="grid grid-cols-1 items-start gap-16 xl:grid-cols-[minmax(0,1fr)_15rem]">
	<article class="grid grid-cols-1 gap-6">
		<header>
			<p class="text-sm font-semibold text-primary">{group?.label}</p>
			<h1 class="mt-1 text-title font-bold">{page.title}</h1>
		</header>
		<DocContent html={page.html} />
		<a
			href={page.editUrl}
			class="inline-flex items-center gap-1.5 justify-self-start text-sm text-muted-foreground transition-colors hover:text-foreground"
		>
			<Pencil size={14} /> Edit this page
		</a>
		<PageNav previous={data.previous} next={data.next} />
	</article>
	{#if page.headings.length > 1}
		<aside class="hidden xl:block"><Toc headings={page.headings} /></aside>
	{/if}
</div>
