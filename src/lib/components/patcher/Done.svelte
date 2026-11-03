<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Download from '@lucide/svelte/icons/download';
	import FileArchive from '@lucide/svelte/icons/file-archive';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import type { Artifact, PatchResult } from '@reseam/browser';
	import Button from '#lib/components/ui/Button.svelte';
	import Callout from '#lib/components/ui/Callout.svelte';
	import Panel from '#lib/components/ui/Panel.svelte';
	import PanelHeader from '#lib/components/ui/PanelHeader.svelte';
	import PanelSection from '#lib/components/ui/PanelSection.svelte';
	import { duration, megabytes, plural } from '#lib/format.ts';
	import { keyBackup, save } from '#lib/patcher/files.ts';
	import type { Patcher, Report } from '#lib/patcher/patcher.svelte.ts';
	import RunReport from './RunReport.svelte';

	let {
		patcher,
		apks,
		results,
		leftOut,
		report,
		newKey,
	}: {
		patcher: Patcher;
		apks: Artifact[];
		results: PatchResult[];
		leftOut: string[];
		report: Report;
		newKey: boolean;
	} = $props();

	const apk = $derived(patcher.inspection?.apk);
	const label = $derived(apk?.application_label ?? apk?.package_name ?? 'Your app');
	// One file: an APK, or every part of a split app in one .apks.
	const artifact = $derived(apks[0]);
	const split = $derived(artifact.name.endsWith('.apks'));
	const fileName = $derived(
		`${[apk?.package_name ?? 'app', apk?.version_name, 'reseam'].filter(Boolean).join('-')}.${split ? 'apks' : 'apk'}`
	);
	const applied = $derived(
		results.filter((result) => !result.hidden && result.status.kind === 'applied').length
	);

	let keySaved = $state(false);

	async function downloadKey() {
		const key = await patcher.exportKey();
		if (!key) return;
		save(keyBackup(key), 'reseam-signing-key.zip');
		keySaved = true;
	}
</script>

<Panel labelledby="done-title">
	<PanelHeader
		id="done-title"
		icon={CircleCheck}
		title="{label} is ready"
		subtitle={[
			apk?.version_name && `Version ${apk.version_name}`,
			plural(applied, 'patch', 'patches'),
			duration(report.milliseconds),
		]
			.filter(Boolean)
			.join(' · ')}
	/>
	<PanelSection class="grid grid-cols-1 gap-4">
		<div
			class="flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface px-4 py-3.5 sm:flex-row sm:items-center"
		>
			<FileArchive size={20} class="hidden shrink-0 text-on-surface-variant sm:block" />
			<div class="min-w-0 flex-1">
				<p class="truncate text-label-large">{fileName}</p>
				<p class="text-body-small text-on-surface-variant">{megabytes(artifact.file.size)}</p>
			</div>
			<Button onclick={() => save(artifact.file, fileName)}><Download size={16} /> Download</Button>
		</div>
		{#if split}
			<p class="text-body-medium text-on-surface-variant">
				Install the .apks file with a split APK installer.
			</p>
		{/if}
		{#if leftOut.length > 0}
			<Callout
				icon={TriangleAlert}
				tone="warning"
				title="Built without {plural(leftOut.length, 'patch', 'patches')}"
			>
				<p class="mt-1 text-on-surface-variant">
					{leftOut.map(patcher.patchName).join(', ')} could not be applied, so {label} is ready without
					{leftOut.length === 1 ? 'it' : 'them'}. The run report says why.
				</p>
			</Callout>
		{/if}
		{#if newKey}
			<Callout icon={KeyRound} title="Back up your signing key">
				<p class="mt-1 text-on-surface-variant">
					This browser made the key that signed {label}. Updates must be signed with the same key,
					so keep a copy somewhere safe.
				</p>
				<Button variant="outline" size="sm" class="mt-3" onclick={downloadKey}
					>{keySaved ? 'Download again' : 'Download key backup'}</Button
				>
			</Callout>
		{/if}
	</PanelSection>
	<PanelSection><RunReport {patcher} {report} /></PanelSection>
	<PanelSection class="flex flex-col-reverse gap-2 py-4 sm:flex-row sm:justify-end">
		<Button variant="ghost" size="lg" onclick={() => patcher.clearApp()}>Patch another app</Button>
		<Button variant="outline" size="lg" onclick={() => patcher.edit()}>Change patches</Button>
	</PanelSection>
</Panel>
