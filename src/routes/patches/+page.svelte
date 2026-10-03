<script lang="ts">
	import { fetchLatestPatches } from '#lib/api.ts';
	import { groupByApp, matches } from '#lib/catalog.ts';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import AppList from '#lib/components/patches/AppList.svelte';
	import PatchItem from '#lib/components/patches/PatchItem.svelte';
	import SearchField from '#lib/components/ui/SearchField.svelte';
	import { fresh } from '#lib/fresh.svelte.ts';

	let { data } = $props();

	const release = fresh(() => data.release, fetchLatestPatches);

	let query = $state('');
	let selected = $state<string | null | undefined>();

	const groups = $derived(groupByApp(release.value.release.patches ?? []));
	const filtered = $derived(
		[...groups]
			.filter(([app]) => selected === undefined || app === selected)
			.map(([app, patches]) => [app, patches.filter((patch) => matches(patch, query))] as const)
			.filter(([, patches]) => patches.length > 0)
	);
	const apps = $derived(
		[...groups].map(([id, patches]) => ({
			id,
			count: patches.filter((patch) => matches(patch, query)).length,
		}))
	);
</script>

<PageMeta
	title="Patches · Reseam"
	description="Every patch in the official Reseam bundle, by app."
/>

<h1 class="sr-only">Patches</h1>
<div class="container-page">
	<div class="py-8 sm:py-10">
		<SearchField bind:value={query} label="Search patches" size="lg" />
	</div>
	<div
		class="grid grid-cols-1 items-start gap-6 pb-20 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-14"
	>
		<AppList {apps} total={apps.reduce((sum, app) => sum + app.count, 0)} bind:selected />
		<div class="grid gap-9">
			{#each filtered as [app, patches] (app)}
				<section aria-label={app ?? 'Any app'}>
					<header class="flex items-baseline justify-between gap-3 px-1 pb-2.5">
						<h2 class={app ? 'truncate font-mono text-sm font-semibold' : 'font-semibold'}>
							{app ?? 'Any app'}
						</h2>
						<span class="text-sm text-muted-foreground tabular-nums">{patches.length}</span>
					</header>
					<ul
						class="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card"
					>
						{#each patches as patch (patch.id)}<PatchItem {patch} />{/each}
					</ul>
				</section>
			{:else}
				<div
					class="grid justify-items-center gap-3 rounded-lg border border-dashed border-border px-6 py-16 text-center text-muted-foreground"
				>
					{#if groups.size === 0}
						<p>The current release has no patches to list.</p>
					{:else}
						<p>No patches match “{query.trim()}”.</p>
						<button
							type="button"
							onclick={() => (query = '')}
							class="text-sm font-medium text-foreground hover:text-primary">Clear search</button
						>
					{/if}
				</div>
			{/each}
			{#if release.failed}
				<p role="status" class="text-sm text-muted-foreground">
					Showing the patches from when this site was built. The API at your configured address did
					not answer.
				</p>
			{/if}
		</div>
	</div>
</div>
