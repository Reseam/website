<script lang="ts">
	import PackageX from '@lucide/svelte/icons/package-x';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import type { Preset } from '@reseam/browser';
	import { Label } from 'bits-ui';
	import Button from '#lib/components/ui/Button.svelte';
	import Callout from '#lib/components/ui/Callout.svelte';
	import Checkbox from '#lib/components/ui/Checkbox.svelte';
	import Panel from '#lib/components/ui/Panel.svelte';
	import PanelHeader from '#lib/components/ui/PanelHeader.svelte';
	import SearchField from '#lib/components/ui/SearchField.svelte';
	import Segmented from '#lib/components/ui/Segmented.svelte';
	import type { Patcher } from '#lib/patcher/patcher.svelte.ts';
	import { preset, reference, supportedVersions } from '#lib/patcher/selection.ts';
	import PatchRow from './PatchRow.svelte';

	let { patcher }: { patcher: Patcher } = $props();

	let query = $state('');

	const presets: { value: Preset; label: string }[] = [
		{ value: 'recommended', label: 'Recommended' },
		{ value: 'all', label: 'All' },
		{ value: 'none', label: 'None' },
	];

	const apk = $derived(patcher.inspection?.apk);
	const versions = $derived(patcher.inspection ? supportedVersions(patcher.inspection) : []);
	const mismatched = $derived(patcher.listed.some((patch) => patch.incompatibility));
	// Patches made for this app come first, patches for any app after them.
	const visible = $derived(
		patcher.listed
			.filter((patch) =>
				`${patch.name} ${patch.description}`
					.toLocaleLowerCase()
					.includes(query.trim().toLocaleLowerCase())
			)
			.toSorted(
				(left, right) =>
					Number(left.compatibility.kind === 'universal') -
						Number(right.compatibility.kind === 'universal') || left.name.localeCompare(right.name)
			)
	);
	const activePreset = $derived(
		presets.find(({ value }) => {
			const keys = preset(patcher.listed, value, patcher.ignoreVersions);
			return keys.length === patcher.chosen.size && keys.every((key) => patcher.chosen.has(key));
		})?.value
	);
</script>

{#if patcher.listed.length === 0}
	<Panel>
		<PanelHeader
			icon={PackageX}
			tone="muted"
			title="No patches for this app"
			subtitle="The loaded bundles have nothing for {apk?.package_name ?? 'it'}."
		>
			{#snippet aside()}<Button variant="outline" size="sm" href="/patches/">Supported apps</Button
				>{/snippet}
		</PanelHeader>
	</Panel>
{:else}
	<Panel labelledby="patches-title">
		<div class="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4 sm:px-6">
			<h2 id="patches-title" class="mr-auto font-semibold">Patches</h2>
			<Segmented
				label="Select patches"
				value={activePreset}
				options={presets}
				onchange={(value) => patcher.choosePreset(value)}
			/>
		</div>
		{#if mismatched}
			<div class="border-b border-border px-5 py-4 sm:px-6">
				<Callout icon={TriangleAlert} tone="warning">
					<p>
						Some patches are not made for {apk?.version_name
							? `version ${apk.version_name}`
							: 'this version'}.
						{#if versions.length > 0}They support {versions.slice(-3).join(', ')}{versions.length >
							3
								? ' and older'
								: ''}.{/if}
					</p>
					<div class="mt-2.5 flex items-center gap-2.5">
						<Checkbox
							id="any-version"
							checked={patcher.ignoreVersions}
							onCheckedChange={(value) => patcher.allowAnyVersion(value)}
						/>
						<Label.Root for="any-version" class="text-muted-foreground"
							>Use them anyway. They may not work.</Label.Root
						>
					</div>
				</Callout>
			</div>
		{/if}
		{#if patcher.listed.length > 8}
			<div class="border-b border-border px-5 py-3 sm:px-6">
				<SearchField bind:value={query} label="Search patches" />
			</div>
		{/if}
		<ul class="divide-y divide-border">
			{#each visible as patch (reference(patch))}
				<PatchRow {patcher} {patch} />
			{:else}
				<li class="px-6 py-10 text-center text-sm text-muted-foreground">
					No patches match “{query.trim()}”.
				</li>
			{/each}
		</ul>
	</Panel>
{/if}
