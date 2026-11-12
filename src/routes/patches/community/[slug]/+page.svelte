<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ShieldAlert from '@lucide/svelte/icons/shield-alert';
	import { Tabs } from 'bits-ui';
	import { addSourceLink } from '#lib/add-source.ts';
	import { fetchCommunityBundle } from '#lib/api.ts';
	import { appNames } from '#lib/apps.svelte.ts';
	import { groupByApp } from '#lib/catalog.ts';
	import BundleFacts from '#lib/components/community/BundleFacts.svelte';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import AppGroup from '#lib/components/patches/AppGroup.svelte';
	import ReleaseNotes from '#lib/components/updates/ReleaseNotes.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Callout from '#lib/components/ui/Callout.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import { pillClass } from '#lib/components/ui/pill.ts';
	import Markdown from '#lib/components/ui/Markdown.svelte';
	import { fresh } from '#lib/fresh.svelte.ts';
	import { longDate } from '#lib/format.ts';
	import { renderDocument } from '#lib/markdown.ts';
	import { parseNotes } from '#lib/notes.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';

	const SHOWN_RELEASES = 5;
	const TAB = `h-8 px-3.5 ${pillClass.tab}`;

	let { data } = $props();

	// A source taken off the list since the build keeps showing what the build saw.
	const current = fresh(
		() => data.bundle,
		async (apiUrl) => (await fetchCommunityBundle(apiUrl, data.bundle.slug)) ?? data.bundle
	);
	const bundle = $derived(current.value);
	const latest = $derived(bundle.releases.find((release) => release.version === bundle.version));
	const groups = $derived(groupByApp(latest?.patches ?? []));
	const names = appNames(
		() => data.apps,
		() => bundle.apps
	);
</script>

<PageMeta
	title="{bundle.name} · Reseam"
	description={bundle.description || m.community_meta_description()}
/>

<div class="container-page">
	<div class="mx-auto grid max-w-232 gap-8 pt-10 pb-20 sm:pt-14">
		<header class="grid gap-4">
			<a
				href={localizeHref('/patches/community/')}
				class="inline-flex items-center gap-1 justify-self-start text-body-medium text-on-surface-variant transition-colors hover:text-on-surface"
			>
				<ChevronLeft size={16} />
				{m.community_all()}
			</a>
			<div class="grid gap-2">
				<h1 class="text-headline-large break-words sm:text-display-medium">{bundle.name}</h1>
				<p class="text-body-large text-on-surface-variant">
					{m.by_author({ author: bundle.author })}
				</p>
			</div>
			{#if bundle.description}<p class="max-w-[72ch] text-body-large">{bundle.description}</p>{/if}
			<Button href={addSourceLink(bundle.index_url)} size="lg" class="mt-2 justify-self-start"
				>{m.community_add()}</Button
			>
		</header>

		<Callout icon={ShieldAlert}>{m.community_trust({ author: bundle.author })}</Callout>

		<BundleFacts {bundle} />

		<Tabs.Root value="patches" class="grid gap-6">
			<Tabs.List class="flex flex-wrap gap-2">
				<Tabs.Trigger value="patches" class={TAB}
					>{m.community_tab_patches({ count: bundle.patches })}</Tabs.Trigger
				>
				{#if bundle.readme}<Tabs.Trigger value="readme" class={TAB}
						>{m.community_readme()}</Tabs.Trigger
					>{/if}
				<Tabs.Trigger value="releases" class={TAB}>{m.community_releases()}</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="patches" class="grid gap-9">
				{#each groups as [app, patches] (app)}
					<AppGroup {app} info={app === null ? undefined : names.value[app]} {patches} />
				{:else}
					<EmptyState><p>{m.community_no_patches()}</p></EmptyState>
				{/each}
			</Tabs.Content>

			{#if bundle.readme}
				<Tabs.Content value="readme">
					<Markdown text={bundle.readme} render={renderDocument} class="text-prose" />
				</Tabs.Content>
			{/if}

			<Tabs.Content value="releases">
				<ol class="grid gap-8">
					{#each bundle.releases.slice(0, SHOWN_RELEASES) as release (release.version)}
						<li class="grid gap-3 border-t border-outline-variant pt-5 first:border-t-0 first:pt-0">
							<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
								<h2 class="text-title-medium">{m.version({ version: release.version })}</h2>
								<time datetime={release.created_at} class="text-body-medium text-on-surface-variant"
									>{longDate(release.created_at)}</time
								>
							</div>
							<ReleaseNotes notes={parseNotes(release.description)} />
						</li>
					{/each}
				</ol>
			</Tabs.Content>
		</Tabs.Root>
	</div>
</div>
