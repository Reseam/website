<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { Megaphone, CircleAlert as AlertCircle, X } from 'lucide-svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { api } from '$lib/stores/api.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import { levelMeta } from '$lib/announcement-meta';
	import { relTime } from '$lib/format';

	let activeTag = $state('');

	onMount(() => {
		settings.load();
		activeTag = page.url.searchParams.get('tag')?.trim() ?? '';
	});

	$effect(() => {
		void api.loadAnnouncements(activeTag);
	});

	const resource = $derived(api.announcements);
</script>

<svelte:head>
	<title>Announcements · Reseam</title>
	<meta
		name="description"
		content="The latest Reseam announcements — releases, notices, and community news."
	/>
</svelte:head>

<div class="container mx-auto px-6 py-20 max-w-3xl min-h-[60vh]">
	<div in:fly={{ y: 10, duration: 400 }}>
		<h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Announcements</h1>
		<p class="text-lg text-muted-foreground mb-8">
			Releases, notices, and the occasional heads-up.
		</p>

		{#if activeTag}
			<div class="flex items-center gap-2 mb-8">
				<span class="text-sm text-muted-foreground">Filtered by</span>
				<a
					href="/announcements/"
					class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors capitalize"
				>
					{activeTag}
					<X size={12} />
				</a>
			</div>
		{/if}

		{#if resource.loading}
			<div class="space-y-3">
				{#each [0, 1, 2, 3] as i (i)}
					<div class="h-16 bg-muted rounded-[1rem] animate-pulse"></div>
				{/each}
			</div>
		{:else if resource.error}
			<div
				class="p-6 bg-destructive/10 text-destructive border border-destructive/20 rounded-[1.5rem] flex items-center gap-4"
			>
				<AlertCircle size={20} />
				<p>API unavailable. Try again later, or point to a different endpoint in Settings.</p>
			</div>
		{:else if resource.data && resource.data.length > 0}
			<div class="space-y-3 flex flex-col">
				{#each resource.data as item, idx (item.id)}
					{@const meta = levelMeta(item.level)}
					{@const LevelIcon = meta.icon}
					<a
						href="/announcements/{item.id}/"
						in:fade={{ duration: 300, delay: idx * 60 }}
						class="group flex items-center gap-4 px-5 py-4 bg-card border border-border rounded-[1rem] hover:border-primary/40 hover:bg-muted/30 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
					>
						<div class="p-2 rounded-full flex-shrink-0 {meta.color}">
							<LevelIcon size={16} />
						</div>
						<div class="flex-1 min-w-0">
							<h2
								class="text-base font-semibold truncate group-hover:text-primary transition-colors"
							>
								{item.title}
							</h2>
							<div class="flex items-center gap-2 text-xs text-muted-foreground">
								<span class="uppercase tracking-wide font-medium {meta.color.split(' ')[0]}">
									{meta.label}
								</span>
								<span class="opacity-40">·</span>
								<span>{relTime(item.created_at)}</span>
								{#if item.tags && item.tags.length > 0}
									<span class="opacity-40">·</span>
									<span class="truncate">{item.tags.join(', ')}</span>
								{/if}
							</div>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="text-center py-20 text-muted-foreground flex flex-col items-center">
				<Megaphone size={40} class="mb-4 opacity-20" />
				<p>
					{activeTag
						? `No announcements tagged "${activeTag}".`
						: 'No new announcements at this time.'}
				</p>
			</div>
		{/if}
	</div>
</div>
