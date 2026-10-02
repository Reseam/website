<script lang="ts">
	import { ListChecks, PackageX, Search, TriangleAlert } from 'lucide-svelte';
	import type { Preset } from '@reseam/browser';
	import { cn } from '$lib/cn';
	import type { Patcher } from '$lib/patcher/patcher.svelte';
	import { preset, reference, supportedVersions } from '$lib/patcher/selection';
	import Button from '$lib/components/Button.svelte';
	import Callout from './Callout.svelte';
	import Panel from './Panel.svelte';
	import PanelHeader from './PanelHeader.svelte';
	import PanelSection from './PanelSection.svelte';
	import PatchRow from './PatchRow.svelte';

	let { patcher }: { patcher: Patcher } = $props();

	let query = $state('');

	const presets: { value: Preset; label: string }[] = [
		{ value: 'recommended', label: 'Recommended' },
		{ value: 'all', label: 'All' },
		{ value: 'none', label: 'None' },
	];

	const version = $derived(patcher.inspection?.apk?.version_name);
	const versions = $derived(patcher.inspection ? supportedVersions(patcher.inspection) : []);
	const mismatched = $derived(patcher.listed.some((patch) => patch.incompatibility));
	const label = $derived(
		patcher.inspection?.apk?.application_label ?? patcher.inspection?.apk?.package_name ?? 'App'
	);
	// Patches made for this app come first; universal ones follow as general patches.
	const groups = $derived.by(() => {
		const needle = query.trim().toLocaleLowerCase();
		const visible = patcher.listed
			.filter((patch) =>
				[patch.name, patch.description].some((field) => field.toLocaleLowerCase().includes(needle))
			)
			.toSorted((left, right) => left.name.localeCompare(right.name));
		return [
			{
				title: `${label} patches`,
				patches: visible.filter((patch) => patch.compatibility.kind === 'packages'),
			},
			{
				title: 'General patches',
				patches: visible.filter((patch) => patch.compatibility.kind === 'universal'),
			},
		].filter((group) => group.patches.length > 0);
	});
	const selected = $derived(
		patcher.listed.filter((patch) => patcher.running.has(reference(patch))).length
	);
	const activePreset = $derived(
		presets.find(({ value }) => {
			const keys = preset(patcher.listed, value, patcher.ignoreVersions);
			return keys.length === patcher.chosen.size && keys.every((key) => patcher.chosen.has(key));
		})?.value
	);
</script>

{#if patcher.listed.length === 0}
	<Panel labelledby="patches-title">
		<PanelHeader
			id="patches-title"
			icon={PackageX}
			title="No patches for this app"
			subtitle="The loaded bundles have nothing for {patcher.inspection?.apk?.package_name ??
				'it'}."
		>
			{#snippet actions()}
				<Button variant="ghost" size="sm" href="/patches/">Supported apps</Button>
			{/snippet}
		</PanelHeader>
	</Panel>
{:else}
	<Panel labelledby="patches-title">
		<PanelHeader
			id="patches-title"
			icon={ListChecks}
			title="Patches"
			subtitle="{selected} of {patcher.listed.length} selected"
		/>

		{#if mismatched}
			<PanelSection>
				<Callout icon={TriangleAlert} tone="warning">
					<p>
						Some patches are not made for {version ? `version ${version}` : 'this version'}.
						{#if versions.length > 0}
							They support {versions.slice(-3).join(', ')}{versions.length > 3 ? ' and older' : ''}.
						{/if}
					</p>
					<label class="mt-2 flex cursor-pointer items-center gap-2 text-muted-foreground">
						<input
							type="checkbox"
							checked={patcher.ignoreVersions}
							onchange={(event) => patcher.allowAnyVersion(event.currentTarget.checked)}
							class="size-4 accent-primary"
						/>
						Use them anyway. They may not work.
					</label>
				</Callout>
			</PanelSection>
		{/if}

		<PanelSection class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
			{#if patcher.listed.length > 8}
				<label class="relative block flex-1">
					<span class="sr-only">Search patches</span>
					<Search
						size={16}
						class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
					/>
					<input
						bind:value={query}
						type="search"
						placeholder="Search patches"
						class="h-10 w-full rounded-[0.75rem] border border-border bg-background pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary"
					/>
				</label>
			{/if}
			<div
				role="group"
				aria-label="Select patches"
				class="flex h-10 shrink-0 rounded-[0.75rem] border border-border p-1 sm:ml-auto"
			>
				{#each presets as { value, label } (value)}
					<button
						type="button"
						aria-pressed={activePreset === value}
						onclick={() => patcher.choosePreset(value)}
						class={cn(
							'flex-1 rounded-[0.5rem] px-3 text-sm transition-colors',
							activePreset === value
								? 'bg-primary/15 font-medium text-primary'
								: 'text-muted-foreground hover:text-foreground'
						)}
					>
						{label}
					</button>
				{/each}
			</div>
		</PanelSection>

		{#each groups as group (group.title)}
			<h3
				class="border-t border-border px-5 pb-1 pt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-6"
			>
				{group.title}
			</h3>
			<ul class="divide-y divide-border">
				{#each group.patches as patch (reference(patch))}
					<PatchRow {patcher} {patch} />
				{/each}
			</ul>
		{:else}
			<p class="border-t border-border px-6 py-10 text-center text-sm text-muted-foreground">
				No patches match “{query.trim()}”.
			</p>
		{/each}
	</Panel>
{/if}
