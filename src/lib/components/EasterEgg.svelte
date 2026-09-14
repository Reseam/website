<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { ArrowRight } from 'lucide-svelte';
	import Button from '$lib/components/Button.svelte';

	type Screenshot = { src: string; alt: string; width: number; height: number };

	let {
		title,
		tagline,
		screenshots,
		next,
	}: {
		title: string;
		tagline: string;
		screenshots: Screenshot[];
		next: { href: string; label: string };
	} = $props();
</script>

<svelte:head>
	<title>{title} · Reseam</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="container mx-auto px-6 py-20 max-w-2xl">
	<div in:fly={{ y: 10, duration: 400, easing: cubicOut }}>
		<h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{title}</h1>
		<p class="text-lg text-muted-foreground mb-12">{tagline}</p>

		<div class="flex flex-col gap-6">
			{#each screenshots as screenshot (screenshot.src)}
				<img
					src={screenshot.src}
					alt={screenshot.alt}
					width={screenshot.width}
					height={screenshot.height}
					class="w-full h-auto rounded-[1.5rem] border border-border"
				/>
			{/each}
		</div>

		<Button href={next.href} variant="outlined" size="lg" class="mt-12 rounded-[1rem]">
			{next.label}
			<ArrowRight class="ml-2" size={18} />
		</Button>
	</div>
</div>
