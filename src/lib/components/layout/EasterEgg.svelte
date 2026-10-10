<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Button from '#lib/components/ui/Button.svelte';
	import type { ImageAsset } from '#lib/site.ts';
	import PageMeta from './PageMeta.svelte';

	let {
		title,
		tagline,
		screenshots,
		next,
	}: {
		title: string;
		tagline: string;
		screenshots: ImageAsset[];
		next: { href: string; label: string };
	} = $props();
</script>

<PageMeta title="{title} · Reseam" description={tagline} image={screenshots[0]} noindex />

<div class="container-page">
	<div class="mx-auto grid max-w-190 gap-5 pt-12 pb-20 sm:pt-16">
		<h1 class="text-headline-large sm:text-display-medium">{title}</h1>
		<p class="-mt-2 mb-4 text-body-large text-on-surface-variant">{tagline}</p>
		{#each screenshots as screenshot (screenshot.src)}
			<img {...screenshot} class="h-auto w-full rounded-xl border border-outline-variant" />
		{/each}
		<Button href={next.href} variant="outline" size="lg" class="mt-4 justify-self-start"
			>{next.label} <ArrowRight size={17} /></Button
		>
	</div>
</div>
