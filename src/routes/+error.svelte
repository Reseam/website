<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import Logo from '#lib/components/layout/Logo.svelte';
	import Button from '#lib/components/ui/Button.svelte';

	const missing = $derived(page.status === 404);

	// The pieces drift apart after the page appears, so the change is visible.
	let apart = $state(false);
	onMount(() => requestAnimationFrame(() => (apart = true)));
</script>

<svelte:head><title>{missing ? 'Not found' : 'Error'} · Reseam</title></svelte:head>

<div
	class="container-page grid flex-1 place-content-center justify-items-center gap-3 py-20 text-center"
>
	<Logo class="mb-4 size-28" {apart} />
	<p class="text-sm font-bold tracking-[0.2em] text-primary">{page.status}</p>
	<h1 class="text-title font-bold">{missing ? 'Page not found' : 'Something went wrong'}</h1>
	<p class="text-lg text-muted-foreground">
		{missing ? "This page doesn't exist or has moved." : page.error?.message}
	</p>
	<div class="mt-5 flex flex-wrap justify-center gap-3">
		<Button href="/" size="lg">Back home</Button>
		<Button href="/patches/" size="lg" variant="outline">Browse patches</Button>
	</div>
</div>
