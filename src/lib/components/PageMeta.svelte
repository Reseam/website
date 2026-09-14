<script lang="ts">
	import { page } from '$app/state';
	import { SITE_URL, type ImageAsset } from '$lib/site';
	import card from '$lib/assets/og-card.jpg';

	let {
		title,
		description,
		image = { src: card, alt: 'Reseam: a better way to use your apps', width: 1200, height: 630 },
		type = 'website',
		noindex = false,
	}: {
		title: string;
		description: string;
		image?: ImageAsset;
		type?: 'website' | 'article';
		noindex?: boolean;
	} = $props();

	const url = $derived(SITE_URL + page.url.pathname);
	// Asset imports can render as paths relative to the page, and previews need absolute URLs.
	const imageUrl = $derived(new URL(image.src, url).href);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	{#if noindex}
		<meta name="robots" content="noindex" />
	{/if}
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:type" content={type} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:width" content={String(image.width)} />
	<meta property="og:image:height" content={String(image.height)} />
	<meta property="og:image:alt" content={image.alt} />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>
