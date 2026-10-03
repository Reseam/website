<script lang="ts">
	import Megaphone from '@lucide/svelte/icons/megaphone';
	import { fetchAnnouncements } from '#lib/api.ts';
	import { newestFirst } from '#lib/announcements.ts';
	import { reading } from '#lib/announcements.svelte.ts';
	import AnnouncementItem from '#lib/components/announcements/AnnouncementItem.svelte';
	import TagFilter from '#lib/components/announcements/TagFilter.svelte';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import { fresh } from '#lib/fresh.svelte.ts';

	let { data } = $props();

	const list = fresh(
		() => data.announcements,
		async (apiUrl) => newestFirst(await fetchAnnouncements(apiUrl))
	);

	let tag = $state('');
	const tags = $derived([...new Set(list.value.flatMap((item) => item.tags))].toSorted());
	const shown = $derived(list.value.filter((item) => !tag || item.tags.includes(tag)));

	$effect(() => {
		if (list.value[0]) reading.markSeen(list.value[0].id);
	});
</script>

<PageMeta title="Announcements · Reseam" description="Releases, notices and news from Reseam." />

<div class="container-page">
	<div class="mx-auto grid max-w-232 gap-6 pt-10 pb-20 sm:pt-14">
		<h1 class="text-title font-bold">Announcements</h1>
		{#if tags.length > 0}<TagFilter {tags} bind:value={tag} />{/if}
		{#if shown.length > 0}
			<ul class="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
				{#each shown as announcement (announcement.id)}<AnnouncementItem {announcement} />{/each}
			</ul>
		{:else}
			<div
				class="grid justify-items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center text-muted-foreground"
			>
				<Megaphone size={28} class="opacity-40" />
				<p>{tag ? `No announcements tagged “${tag}”.` : 'No announcements yet.'}</p>
			</div>
		{/if}
	</div>
</div>
