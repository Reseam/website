<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import { fetchAnnouncements } from '#lib/api.ts';
	import LevelBadge from '#lib/components/announcements/LevelBadge.svelte';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import { fresh } from '#lib/fresh.svelte.ts';
	import { longDate } from '#lib/format.ts';

	let { data } = $props();

	const post = fresh(
		() => data.announcement,
		async (apiUrl) =>
			(await fetchAnnouncements(apiUrl)).find(({ id }) => id === data.announcement.id) ??
			data.announcement
	);
	const announcement = $derived(post.value);
</script>

<PageMeta
	title="{announcement.title} · Reseam"
	description={announcement.content?.slice(0, 160) ?? announcement.title}
	type="article"
/>

<div class="container-page">
	<article class="mx-auto grid max-w-232 gap-4 pt-10 pb-20 sm:pt-14">
		<a
			href="/announcements/"
			class="inline-flex items-center gap-1 justify-self-start text-sm text-muted-foreground transition-colors hover:text-foreground"
		>
			<ChevronLeft size={16} /> All announcements
		</a>
		<div><LevelBadge level={announcement.level} /></div>
		<h1 class="text-title font-bold">{announcement.title}</h1>
		<p class="flex flex-wrap gap-3 text-sm text-muted-foreground">
			<time datetime={announcement.created_at}>{longDate(announcement.created_at)}</time>
			{#if announcement.author}<span>by {announcement.author}</span>{/if}
			{#if announcement.archived_at}<span>Archived</span>{/if}
		</p>
		{#if announcement.content}
			<p
				class="mt-2 max-w-[72ch] border-t border-border pt-6 text-[1.05rem] leading-relaxed whitespace-pre-wrap text-foreground/90"
			>
				{announcement.content}
			</p>
		{/if}
		{#if announcement.tags.length > 0}
			<p class="flex flex-wrap gap-3 text-sm text-muted-foreground">
				{#each announcement.tags as tag (tag)}<span>#{tag}</span>{/each}
			</p>
		{/if}
	</article>
</div>
