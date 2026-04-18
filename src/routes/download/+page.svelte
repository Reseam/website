<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { Download, CircleAlert as AlertCircle, Smartphone } from 'lucide-svelte';
	import Button from '$lib/components/Button.svelte';
	import { api } from '$lib/stores/api.svelte';
	import { settings } from '$lib/stores/settings.svelte';

	onMount(() => {
		settings.load();
		void api.loadManager();
	});

	const resource = $derived(api.manager);
</script>

<svelte:head>
	<title>Download · Reseam</title>
	<meta
		name="description"
		content="Get the Reseam Manager to browse and apply patches to your apps."
	/>
</svelte:head>

<div class="container mx-auto px-6 py-20 max-w-2xl">
	<div in:fly={{ y: 10, duration: 400, easing: cubicOut }}>
		<h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Download the App</h1>
		<p class="text-lg text-muted-foreground mb-12">
			Get the Reseam Manager to easily browse and select features you want to add to your phone.
		</p>

		{#if resource.loading}
			<div class="animate-pulse h-64 bg-muted rounded-[1.5rem]"></div>
		{:else if resource.error || !resource.data}
			<div
				class="p-6 bg-destructive/10 text-destructive border border-destructive/20 rounded-[1.5rem] flex items-center gap-4"
			>
				<AlertCircle size={20} />
				<p>We couldn't connect right now. Please try again.</p>
			</div>
		{:else}
			{@const data = resource.data}
			<div
				class="bg-card border border-border shadow-sm rounded-[1.5rem] p-6 sm:p-10 flex flex-col items-center text-center"
			>
				<div class="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
					<Smartphone class="text-primary" size={40} />
				</div>

				<h2 class="text-2xl font-bold mb-2">{data.bundle.name}</h2>
				<span
					class="inline-block bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-medium mb-6"
				>
					Version {data.release.version}
				</span>

				<p class="text-muted-foreground mb-10 max-w-md">
					{data.release.description || data.bundle.description}
				</p>

				<a href={data.release.download_url} class="w-full">
					<Button size="lg" class="w-full text-lg rounded-[1rem] py-6 shadow-sm">
						<Download size={22} class="mr-2" />
						Download APK
					</Button>
				</a>

				<p class="mt-8 text-sm text-muted-foreground">Requires Android 8.0 or newer.</p>
			</div>
		{/if}
	</div>
</div>
