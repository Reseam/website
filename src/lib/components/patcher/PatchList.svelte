<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import PackageX from '@lucide/svelte/icons/package-x';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { patchText, type PatchPreset } from '@reseam/browser';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
	import { Label } from 'bits-ui';
	import Button from '#lib/components/ui/Button.svelte';
	import Callout from '#lib/components/ui/Callout.svelte';
	import Checkbox from '#lib/components/ui/Checkbox.svelte';
	import Panel from '#lib/components/ui/Panel.svelte';
	import PanelHeader from '#lib/components/ui/PanelHeader.svelte';
	import SearchField from '#lib/components/ui/SearchField.svelte';
	import Segmented from '#lib/components/ui/Segmented.svelte';
	import type { Patcher } from '#lib/patcher/patcher.svelte.ts';
	import { reference, supportedVersions } from '#lib/patcher/patches.ts';
	import PatchRow from './PatchRow.svelte';

	let { patcher }: { patcher: Patcher } = $props();

	let query = $state('');

	const presets: { value: PatchPreset; label: string }[] = $derived([
		{ value: 'recommended', label: m.preset_recommended() },
		{ value: 'all', label: m.preset_all() },
		{ value: 'none', label: m.preset_none() },
	]);

	const apk = $derived(patcher.inspection?.apk);
	const versions = $derived(patcher.inspection ? supportedVersions(patcher.inspection) : []);
	const mismatched = $derived(patcher.listed.some((patch) => patch.incompatibility));
	// Patches made for this app come first, patches for any app after them.
	const texts = $derived(
		new Map(patcher.listed.map((patch) => [patch, patchText(patch, [getLocale()])]))
	);
	const visible = $derived(
		patcher.listed
			.filter((patch) =>
				`${texts.get(patch)!.name} ${texts.get(patch)!.description}`
					.toLocaleLowerCase(getLocale())
					.includes(query.trim().toLocaleLowerCase(getLocale()))
			)
			.toSorted(
				(left, right) =>
					Number(left.compatibility.kind === 'universal') -
						Number(right.compatibility.kind === 'universal') ||
					texts.get(left)!.name.localeCompare(texts.get(right)!.name, getLocale())
			)
	);
</script>

{#if patcher.planning?.status === 'failed'}
	<Panel>
		<PanelHeader
			icon={CircleAlert}
			tone="error"
			title={m.patcher_uncombinable_title()}
			subtitle={patcher.planning.problem}
		>
			{#snippet aside()}<Button
					variant="outline"
					size="sm"
					onclick={() => patcher.choosePreset('recommended')}>{m.patcher_use_recommended()}</Button
				>{/snippet}
		</PanelHeader>
	</Panel>
{:else if patcher.listed.length === 0}
	<Panel>
		<PanelHeader
			icon={PackageX}
			tone="muted"
			title={m.patcher_no_patches_title()}
			subtitle={apk?.package_name
				? m.patcher_no_patches_named({ app: apk.package_name })
				: m.patcher_no_patches()}
		>
			{#snippet aside()}<Button variant="outline" size="sm" href={localizeHref('/patches/')}
					>{m.patcher_supported_apps()}</Button
				>{/snippet}
		</PanelHeader>
	</Panel>
{:else}
	<Panel labelledby="patches-title">
		<div
			class="flex flex-wrap items-center gap-3 border-b border-outline-variant px-5 py-4 sm:px-6"
		>
			<h2 id="patches-title" class="mr-auto text-title-medium">{m.patches_title()}</h2>
			<Segmented
				label={m.patcher_select_patches()}
				value={patcher.activePreset}
				options={presets}
				onchange={(value) => patcher.choosePreset(value)}
			/>
		</div>
		{#if mismatched}
			<div class="border-b border-outline-variant px-5 py-4 sm:px-6">
				<Callout icon={TriangleAlert} tone="warning">
					<p>
						{apk?.version_name
							? m.patcher_mismatch_named({ version: apk.version_name })
							: m.patcher_mismatch()}
						{#if versions.length > 0}
							{@const shown = new Intl.ListFormat(getLocale()).format(versions.slice(-3))}
							{versions.length > 3
								? m.patcher_supported_versions_older({ versions: shown })
								: m.patcher_supported_versions({ versions: shown })}
						{/if}
					</p>
					<div class="mt-2.5 flex items-center gap-2.5">
						<Checkbox
							id="any-version"
							checked={patcher.choice.ignore_versions}
							onCheckedChange={(value) => patcher.allowAnyVersion(value)}
						/>
						<Label.Root for="any-version" class="text-on-surface-variant"
							>{m.patcher_any_version()}</Label.Root
						>
					</div>
				</Callout>
			</div>
		{/if}
		{#if patcher.listed.length > 8}
			<div class="border-b border-outline-variant px-5 py-3 sm:px-6">
				<SearchField bind:value={query} label={m.patches_search()} />
			</div>
		{/if}
		<ul class="divide-y divide-outline-variant">
			{#each visible as patch (reference(patch))}
				<PatchRow {patcher} {patch} />
			{:else}
				<li class="px-6 py-10 text-center text-body-medium text-on-surface-variant">
					{m.patches_no_match({ query: query.trim() })}
				</li>
			{/each}
		</ul>
	</Panel>
{/if}
