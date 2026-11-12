<script lang="ts">
	import Layers from '@lucide/svelte/icons/layers';
	import { fetchCommunity } from '#lib/api.ts';
	import { appNames } from '#lib/apps.svelte.ts';
	import { matchesBundle, packagesOfCommunity, patchesApp } from '#lib/community.ts';
	import BundleCard from '#lib/components/community/BundleCard.svelte';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import AppList from '#lib/components/patches/AppList.svelte';
	import PatchViews from '#lib/components/patches/PatchViews.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import SearchField from '#lib/components/ui/SearchField.svelte';
	import { fresh } from '#lib/fresh.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	let { data } = $props();

	const list = fresh(() => data.bundles, fetchCommunity);

	let query = $state('');
	let selected = $state<string | null | undefined>();

	const packages = $derived(packagesOfCommunity(list.value));
	const names = appNames(
		() => data.apps,
		() => packages
	);
	const matching = $derived(
		list.value.filter((bundle) => matchesBundle(bundle, query, names.value))
	);
	const shown = $derived.by(() => {
		const app = selected;
		return app === undefined ? matching : matching.filter((bundle) => patchesApp(bundle, app));
	});
	const apps = $derived([
		...packages
			.map((id) => ({
				id,
				count: matching.filter((bundle) => patchesApp(bundle, id)).length,
				info: names.value[id],
			}))
			.toSorted(
				(a, b) =>
					b.count - a.count ||
					(a.info?.name ?? a.id).localeCompare(b.info?.name ?? b.id, getLocale())
			),
		...(list.value.some((bundle) => bundle.any_app)
			? [{ id: null, count: matching.filter((bundle) => patchesApp(bundle, null)).length }]
			: []),
	]);
</script>

<PageMeta title={m.community_meta_title()} description={m.community_meta_description()} />

<h1 class="sr-only">{m.community_title()}</h1>
<div class="container-page">
	<div class="grid gap-6 py-8 sm:py-10">
		<div class="grid gap-3">
			<PatchViews current="community" />
			<p class="text-body-medium text-on-surface-variant">{m.community_subtitle()}</p>
		</div>
		<SearchField bind:value={query} label={m.community_search()} size="lg" />
	</div>
	{#if list.value.length === 0}
		<div class="pb-20"><EmptyState icon={Layers}><p>{m.community_empty()}</p></EmptyState></div>
	{:else}
		<div
			class="grid grid-cols-1 items-start gap-6 pb-20 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-14"
		>
			<AppList {apps} total={matching.length} bind:selected />
			<div class="grid min-w-0 gap-6">
				{#if shown.length > 0}
					<ul class="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[repeat(2,minmax(0,1fr))]">
						{#each shown as bundle (bundle.slug)}
							<li><BundleCard {bundle} names={names.value} /></li>
						{/each}
					</ul>
				{:else}
					<EmptyState>
						<p>{m.community_no_match()}</p>
						<button
							type="button"
							onclick={() => ((query = ''), (selected = undefined))}
							class="text-label-large text-on-surface hover:text-primary"
							>{m.action_clear_search()}</button
						>
					</EmptyState>
				{/if}
				{#if list.failed}
					<p role="status" class="text-body-medium text-on-surface-variant">
						{m.community_stale()}
					</p>
				{/if}
			</div>
		</div>
	{/if}
</div>
