<script lang="ts">
	import { fly } from 'svelte/transition';
	import { ArrowLeft, Archive, User } from 'lucide-svelte';
	import { levelMeta } from '$lib/announcement-meta';
	import { relTime, fullTime } from '$lib/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const item = $derived(data.announcement);
	const meta = $derived(levelMeta(item.level));
	const LevelIcon = $derived(meta.icon);
</script>

<svelte:head>
	<title>{item.title} · Announcements · Reseam</title>
	{#if item.content}
		<meta name="description" content={item.content.slice(0, 160)} />
	{/if}
	<meta property="og:title" content={item.title} />
	<meta property="og:type" content="article" />
	{#if item.content}
		<meta property="og:description" content={item.content.slice(0, 200)} />
	{/if}
</svelte:head>

<div class="container mx-auto px-6 py-20 max-w-3xl min-h-[60vh]">
	<div in:fly={{ y: 10, duration: 400 }}>
		<a
			href="/announcements/"
			class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
		>
			<ArrowLeft size={16} />
			All announcements
		</a>

		<div
			class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide mb-5 {meta.color}"
		>
			<LevelIcon size={14} />
			{meta.label}
		</div>

		<h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{item.title}</h1>

		<div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-8">
			<time datetime={item.created_at} title={item.created_at}>
				{fullTime(item.created_at)}
				<span class="opacity-60">({relTime(item.created_at)})</span>
			</time>
			{#if item.author}
				<span class="inline-flex items-center gap-1.5">
					<User size={14} />
					{item.author}
				</span>
			{/if}
			{#if item.archived_at}
				<span class="inline-flex items-center gap-1.5 text-amber-500/80">
					<Archive size={14} />
					Archived {relTime(item.archived_at)}
				</span>
			{/if}
		</div>

		{#if item.content}
			<div class="text-foreground/90 leading-relaxed whitespace-pre-wrap">
				{item.content}
			</div>
		{/if}

		{#if item.tags && item.tags.length > 0}
			<div class="flex gap-2 mt-10 flex-wrap">
				{#each item.tags as tag (tag)}
					<a
						href="/announcements/?tag={encodeURIComponent(tag)}"
						class="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors capitalize"
					>
						{tag}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
