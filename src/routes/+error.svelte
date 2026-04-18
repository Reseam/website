<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/Button.svelte';
</script>

<svelte:head>
	<title>{page.status === 404 ? 'Not found' : 'Error'} · Reseam</title>
</svelte:head>

<div
	class="container mx-auto px-6 py-20 max-w-xl text-center flex-1 flex flex-col items-center justify-center"
>
	<div class="text-primary text-6xl font-bold tracking-tight mb-4">{page.status}</div>
	<h1 class="text-2xl sm:text-3xl font-bold mb-4">
		{page.status === 404 ? 'Page not found' : 'Something went wrong'}
	</h1>
	<p class="text-muted-foreground mb-8">
		{page.error?.message || "The page you're looking for doesn't exist."}
	</p>
	<a href="/">
		<Button size="lg">Back home</Button>
	</a>
</div>
