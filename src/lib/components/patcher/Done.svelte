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
	import { duration, megabytes } from '#lib/format.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { save } from '#lib/patcher/files.ts';
	import type { Patcher, Report } from '#lib/patcher/patcher.svelte.ts';
	import RunReport from './RunReport.svelte';

	let {
		patcher,
		apks,
		results,
		leftOut,
		report,
		newKey,
		onKeyBackup,
	}: {
		patcher: Patcher;
		apks: Artifact[];
		results: PatchResult[];
		leftOut: string[];
		report: Report;
		newKey: boolean;
		/** Opens the signing key dialog, where the backup is made. */
		onKeyBackup: () => void;
	} = $props();

	const apk = $derived(patcher.inspection?.apk);
	const label = $derived(apk?.application_label ?? apk?.package_name ?? m.patcher_your_app());
	// One file: an APK, or every part of a split app in one .apks.
	const artifact = $derived(apks[0]);
	const split = $derived(artifact.name.endsWith('.apks'));
	const fileName = $derived(
		`${[apk?.package_name ?? 'app', apk?.version_name, 'reseam'].filter(Boolean).join('-')}.${split ? 'apks' : 'apk'}`
	);
	const applied = $derived(
		results.filter((result) => !result.hidden && result.status.kind === 'applied').length
	);
</script>

<Panel labelledby="done-title">
	<PanelHeader
		id="done-title"
		icon={CircleCheck}
		title={m.patcher_ready({ app: label })}
		subtitle={[
			apk?.version_name && m.version({ version: apk.version_name }),
			m.patcher_patch_count({ count: applied }),
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
			<Button onclick={() => save(artifact.file, fileName)}
				><Download size={16} /> {m.action_download()}</Button
			>
		</div>
		{#if split}
			<p class="text-body-medium text-on-surface-variant">
				{m.patcher_split_install()}
			</p>
		{/if}
		{#if leftOut.length > 0}
			<Callout
				icon={TriangleAlert}
				tone="warning"
				title={m.patcher_left_out_title({ count: leftOut.length })}
			>
				<p class="mt-1 text-on-surface-variant">
					{m.patcher_left_out_text({
						count: leftOut.length,
						patches: new Intl.ListFormat(getLocale()).format(leftOut.map(patcher.patchName)),
						app: label,
					})}
				</p>
			</Callout>
		{/if}
		{#if newKey}
			<Callout icon={KeyRound} title={m.patcher_backup_title()}>
				<p class="mt-1 text-on-surface-variant">
					{m.patcher_backup_text({ app: label })}
				</p>
				<Button variant="outline" size="sm" class="mt-3" onclick={onKeyBackup}
					>{m.patcher_backup_action()}</Button
				>
			</Callout>
		{/if}
	</PanelSection>
	<PanelSection><RunReport {patcher} {report} /></PanelSection>
	<PanelSection class="flex flex-col-reverse gap-2 py-4 sm:flex-row sm:justify-end">
		<Button variant="ghost" size="lg" onclick={() => patcher.clearApp()}
			>{m.patcher_patch_another()}</Button
		>
		<Button variant="outline" size="lg" onclick={() => patcher.edit()}
			>{m.patcher_change_patches()}</Button
		>
	</PanelSection>
</Panel>
