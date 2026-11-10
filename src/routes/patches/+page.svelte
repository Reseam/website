<script lang="ts">
	import { fetchLatestPatches } from '#lib/api.ts';
	import { appNames } from '#lib/apps.svelte.ts';
	import { groupByApp, matches, packagesOf } from '#lib/catalog.ts';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import AppIcon from '#lib/components/patches/AppIcon.svelte';
	import AppList from '#lib/components/patches/AppList.svelte';
	import PatchItem from '#lib/components/patches/PatchItem.svelte';
	import SearchField from '#lib/components/ui/SearchField.svelte';
	import { fresh } from '#lib/fresh.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';

	let { data } = $props();

	const release = fresh(() => data.release, fetchLatestPatches);

	let query = $state('');
	let selected = $state<string | null | undefined>();

	const groups = $derived(groupByApp(release.value.release.patches ?? []));
	const names = appNames(
		() => data.apps,
		() => packagesOf(groups)
	);
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
			info: id === null ? undefined : names.value[id],
		}))
	);
</script>

<PageMeta title={m.patches_meta_title()} description={m.patches_meta_description()} />

<h1 class="sr-only">{m.patches_title()}</h1>
<div class="container-page">
	<div class="py-8 sm:py-10">
		<SearchField bind:value={query} label={m.patches_search()} size="lg" />
	</div>
	<div
		class="grid grid-cols-1 items-start gap-6 pb-20 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-14"
	>
		<AppList {apps} total={apps.reduce((sum, app) => sum + app.count, 0)} bind:selected />
		<div class="grid gap-9">
			{#each filtered as [app, patches] (app)}
				{@const info = app === null ? undefined : names.value[app]}
				<section aria-label={info?.name ?? app ?? m.catalog_any_app()}>
					<header class="flex items-center justify-between gap-3 px-1 pb-2.5">
						{#if info}
							<div class="flex min-w-0 items-center gap-3">
								<AppIcon icon={info.icon} size={32} />
								<div class="grid min-w-0">
									<h2 class="truncate text-title-small">{info.name}</h2>
									<span class="truncate font-mono text-mono-xs text-on-surface-variant">{app}</span>
								</div>
							</div>
						{:else}
							<h2 class={app ? 'truncate font-mono text-mono-sm-semibold' : 'text-title-small'}>
								{app ?? m.catalog_any_app()}
							</h2>
						{/if}
						<span class="text-body-medium text-on-surface-variant tabular-nums"
							>{patches.length}</span
						>
					</header>
					<ul
						class="divide-y divide-outline-variant overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low"
					>
						{#each patches as patch (patch.id)}<PatchItem {patch} />{/each}
					</ul>
				</section>
			{:else}
				<div
					class="grid justify-items-center gap-3 rounded-lg border border-dashed border-outline-variant px-6 py-16 text-center text-on-surface-variant"
				>
					{#if groups.size === 0}
						<p>{m.patches_empty()}</p>
					{:else}
						<p>{m.patches_no_match({ query: query.trim() })}</p>
						<button
							type="button"
							onclick={() => (query = '')}
							class="text-label-large text-on-surface hover:text-primary"
							>{m.action_clear_search()}</button
						>
					{/if}
				</div>
			{/each}
			{#if release.failed}
				<p role="status" class="text-body-medium text-on-surface-variant">
					{m.patches_stale()}
				</p>
			{/if}
		</div>
	</div>
</div>
