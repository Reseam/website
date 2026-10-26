<script lang="ts">
	import Megaphone from '@lucide/svelte/icons/megaphone';
	import { reading } from '#lib/announcements.svelte.ts';
	import EarlierEntry from '#lib/components/updates/EarlierEntry.svelte';
	import EntryBadge from '#lib/components/updates/EntryBadge.svelte';
	import EntryBody from '#lib/components/updates/EntryBody.svelte';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import FilterChips from '#lib/components/ui/FilterChips.svelte';
	import { fresh } from '#lib/fresh.svelte.ts';
	import { shortDate } from '#lib/format.ts';
	import { entryPath, KINDS, loadUpdates } from '#lib/updates.ts';

	let { data } = $props();

	const PAGE = 20;
	const OPEN = 5;

	const list = fresh(() => data.entries, loadUpdates);

	let kind = $state('');
	let shown = $state(PAGE);
	const filtered = $derived(list.value.filter((entry) => !kind || entry.kind === kind));
	const latest = $derived(filtered.slice(0, OPEN));
	const earlier = $derived(filtered.slice(OPEN));

	$effect(() => {
		const news = list.value.find((entry) => entry.kind === 'news');
		if (news) reading.markSeen(Number(news.key));
	});
</script>

<PageMeta
	title="Updates · Reseam"
	description="Releases of Reseam Patches and Reseam Manager, and news from Reseam."
/>

<div class="container-page">
	<div class="mx-auto grid max-w-232 gap-8 pt-10 pb-20 sm:pt-14">
		<header class="grid gap-3">
			<h1 class="text-headline-large sm:text-display-medium">Updates</h1>
			<p class="text-body-large text-on-surface-variant">
				Releases of Reseam Patches and Reseam Manager, and news from Reseam.
			</p>
		</header>
		<FilterChips options={KINDS} bind:value={kind} label="Show" />

		{#if latest.length > 0}
			{#each latest as entry, i (entryPath(entry))}
				<article
					class={[
						'grid gap-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-6',
						i > 0 && 'border-t border-outline-variant pt-8',
					]}
				>
					<time
						datetime={entry.date}
						class="text-body-medium text-on-surface-variant tabular-nums sm:pt-2"
					>
						{shortDate(entry.date)}
					</time>
					<div class="grid gap-4">
						<div class="flex flex-wrap items-center gap-3">
							<h2 class="text-headline-small">
								<a href={entryPath(entry)} class="transition-colors hover:text-primary"
									>{entry.title}</a
								>
							</h2>
							<EntryBadge {entry} />
						</div>
						<EntryBody {entry} />
					</div>
				</article>
			{/each}

			{#if earlier.length > 0}
				<section aria-labelledby="earlier" class="grid gap-1 border-t border-outline-variant pt-6">
					<h2 id="earlier" class="text-label-large text-on-surface-variant">Earlier updates</h2>
					<ul class="divide-y divide-outline-variant">
						{#each earlier.slice(0, shown) as entry (entryPath(entry))}<EarlierEntry
								{entry}
							/>{/each}
					</ul>
					{#if earlier.length > shown}
						<Button variant="outline" class="justify-self-start" onclick={() => (shown += PAGE)}>
							Show older updates
						</Button>
					{/if}
				</section>
			{/if}
		{:else}
			<div
				class="grid justify-items-center gap-3 rounded-xl border border-dashed border-outline-variant px-6 py-16 text-center text-on-surface-variant"
			>
				<Megaphone size={28} class="opacity-40" />
				<p>Nothing here yet.</p>
			</div>
		{/if}
	</div>
</div>
