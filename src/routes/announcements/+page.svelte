<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { Megaphone, CircleAlert as AlertCircle, X } from 'lucide-svelte';
	import { page } from '$app/state';
	import { fetchAnnouncements } from '$lib/api';
	import { settings } from '$lib/settings.svelte';
	import { LEVELS } from '$lib/announcement-meta';
	import { relTime } from '$lib/format';

	const activeTag = $derived(page.url.searchParams.get('tag')?.trim() ?? '');
	const announcements = $derived(fetchAnnouncements(settings.apiUrl, activeTag));
</script>

<svelte:head>
	<title>Announcements · Reseam</title>
	<meta
		name="description"
		content="The latest Reseam announcements: releases, notices, and community news."
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

		{#await announcements}
			<div class="space-y-3">
				{#each [0, 1, 2, 3] as i (i)}
					<div class="h-16 bg-muted rounded-[1rem] animate-pulse"></div>
				{/each}
			</div>
		{:then items}
			{#if items.length === 0}
				<div class="text-center py-20 text-muted-foreground flex flex-col items-center">
					<Megaphone size={40} class="mb-4 opacity-20" />
					<p>
						{activeTag
							? `No announcements tagged "${activeTag}".`
							: 'No new announcements at this time.'}
					</p>
				</div>
			{:else}
				<div class="space-y-3 flex flex-col">
					{#each items as item, idx (item.id)}
						{@const level = LEVELS[item.level]}
						<a
							href="/announcements/{item.id}/"
							in:fade={{ duration: 300, delay: idx * 60 }}
							class="group flex items-center gap-4 px-5 py-4 bg-card border border-border rounded-[1rem] hover:border-primary/40 hover:bg-muted/30 transition-colors"
						>
							<div class="p-2 rounded-full flex-shrink-0 {level.color}">
								<level.icon size={16} />
							</div>
							<div class="flex-1 min-w-0">
								<h2
									class="text-base font-semibold truncate group-hover:text-primary transition-colors"
								>
									{item.title}
								</h2>
								<div class="flex items-center gap-2 text-xs text-muted-foreground">
									<span class="uppercase tracking-wide font-medium {level.color.split(' ')[0]}">
										{level.label}
									</span>
									<span class="opacity-40">·</span>
									<span>{relTime(item.created_at)}</span>
									{#if item.tags.length > 0}
										<span class="opacity-40">·</span>
										<span class="truncate">{item.tags.join(', ')}</span>
									{/if}
								</div>
							</div>
						</a>
					{/each}
				</div>
			{/if}
		{:catch}
			<div
				class="p-6 bg-destructive/10 text-destructive border border-destructive/20 rounded-[1.5rem] flex items-center gap-4"
			>
				<AlertCircle size={20} />
				<p>API unavailable. Try again later, or point to a different endpoint in Settings.</p>
			</div>
		{/await}
	</div>
</div>
