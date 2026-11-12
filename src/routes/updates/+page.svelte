<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import Megaphone from '@lucide/svelte/icons/megaphone';
	import { reading } from '#lib/announcements.svelte.ts';
	import EarlierEntry from '#lib/components/updates/EarlierEntry.svelte';
	import EntryBadge from '#lib/components/updates/EntryBadge.svelte';
	import EntryBody from '#lib/components/updates/EntryBody.svelte';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
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

<PageMeta title={m.updates_meta_title()} description={m.updates_lead()} />

<div class="container-page">
	<div class="mx-auto grid max-w-232 gap-8 pt-10 pb-20 sm:pt-14">
		<header class="grid gap-3">
			<h1 class="text-headline-large sm:text-display-medium">{m.updates_title()}</h1>
			<p class="text-body-large text-on-surface-variant">
				{m.updates_lead()}
			</p>
		</header>
		<FilterChips
			options={KINDS.map((option) => ({ value: option.value, label: option.label() }))}
			bind:value={kind}
			label={m.updates_show()}
		/>

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
					<h2 id="earlier" class="text-label-large text-on-surface-variant">
						{m.updates_earlier()}
					</h2>
					<ul class="divide-y divide-outline-variant">
						{#each earlier.slice(0, shown) as entry (entryPath(entry))}<EarlierEntry
								{entry}
							/>{/each}
					</ul>
					{#if earlier.length > shown}
						<Button variant="outline" class="justify-self-start" onclick={() => (shown += PAGE)}>
							{m.updates_show_older()}
						</Button>
					{/if}
				</section>
			{/if}
		{:else}
			<EmptyState icon={Megaphone}>
				<p>{m.updates_empty()}</p>
			</EmptyState>
		{/if}
	</div>
</div>
