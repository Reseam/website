<script lang="ts">
	import { CircleCheck, Download, FileArchive, KeyRound, LoaderCircle } from 'lucide-svelte';
	import type { Artifact, PatchResult } from '@reseam/browser';
	import Button from '$lib/components/Button.svelte';
	import { duration, megabytes } from '$lib/format';
	import { keyBackup, save, splitArchive } from '$lib/patcher/files';
	import type { Patcher, Report } from '$lib/patcher/patcher.svelte';
	import Callout from './Callout.svelte';
	import Panel from './Panel.svelte';
	import PanelHeader from './PanelHeader.svelte';
	import PanelSection from './PanelSection.svelte';
	import RunReport from './RunReport.svelte';

	let {
		patcher,
		apks,
		results,
		report,
		newKey,
	}: {
		patcher: Patcher;
		apks: Artifact[];
		results: PatchResult[];
		report: Report;
		newKey: boolean;
	} = $props();

	const apk = $derived(patcher.inspection?.apk);
	const label = $derived(apk?.application_label ?? apk?.package_name ?? 'Your app');
	const split = $derived(apks.length > 1);
	const fileName = $derived(
		`${[apk?.package_name ?? 'app', apk?.version_name, 'reseam'].filter(Boolean).join('-')}.${split ? 'apks' : 'apk'}`
	);
	const size = $derived(apks.reduce((total, artifact) => total + artifact.file.size, 0));
	const applied = $derived(
		results.filter((result) => !result.hidden && result.status.kind === 'applied').length
	);

	let preparing = $state(false);
	let keySaved = $state(false);

	async function downloadApp() {
		if (!split) return save(apks[0].file, fileName);
		preparing = true;
		try {
			save(await splitArchive(apks.map((artifact) => artifact.file)), fileName);
		} finally {
			preparing = false;
		}
	}

	async function downloadKey() {
		const key = await patcher.exportKey();
		if (!key) return;
		save(keyBackup(key), 'reseam-signing-key.zip');
		keySaved = true;
	}

	const apkName = (artifact: Artifact) => artifact.name.split('/').at(-1)!;
</script>

<Panel labelledby="done-title">
	<PanelHeader
		id="done-title"
		icon={CircleCheck}
		tone="primary"
		title="{label} is ready"
		subtitle={[
			apk?.version_name && `Version ${apk.version_name}`,
			`${applied} ${applied === 1 ? 'patch' : 'patches'}`,
			duration(report.milliseconds),
		]
			.filter(Boolean)
			.join(' · ')}
	/>

	<PanelSection class="space-y-4">
		<div
			class="flex flex-col gap-4 rounded-[1rem] border border-border bg-background/60 p-4 sm:flex-row sm:items-center"
		>
			<div class="flex min-w-0 flex-1 items-center gap-3">
				<FileArchive size={20} class="shrink-0 text-muted-foreground" />
				<div class="min-w-0">
					<p class="truncate text-sm font-medium">{fileName}</p>
					<p class="text-xs text-muted-foreground">
						{megabytes(size)}{split ? ` · ${apks.length} split APKs` : ''}
					</p>
				</div>
			</div>
			<Button class="gap-2" onclick={downloadApp} disabled={preparing}>
				{#if preparing}
					<LoaderCircle size={16} class="animate-spin" /> Preparing
				{:else}
					<Download size={16} /> Download
				{/if}
			</Button>
		</div>
		{#if split}
			<p class="text-sm text-muted-foreground">
				Install the .apks file with a split APK installer.
			</p>
			<details class="text-sm">
				<summary class="cursor-pointer select-none text-muted-foreground hover:text-foreground">
					Download APKs one by one
				</summary>
				<ul class="mt-3 divide-y divide-border rounded-[0.875rem] border border-border">
					{#each apks as artifact (artifact.name)}
						<li>
							<button
								type="button"
								onclick={() => save(artifact.file, apkName(artifact))}
								class="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50"
							>
								<span class="min-w-0 flex-1 truncate">{apkName(artifact)}</span>
								<span class="tabular-nums text-muted-foreground"
									>{megabytes(artifact.file.size)}</span
								>
								<Download size={14} class="text-muted-foreground" />
							</button>
						</li>
					{/each}
				</ul>
			</details>
		{/if}
		{#if newKey}
			<Callout icon={KeyRound} tone="primary" title="Back up your signing key">
				<p class="mt-1 text-muted-foreground">
					This browser made the key that signed {label}. Updates must be signed with the same key,
					so keep a copy somewhere safe.
				</p>
				<Button variant="outlined" size="sm" class="mt-3" onclick={downloadKey}>
					{keySaved ? 'Download again' : 'Download key backup'}
				</Button>
			</Callout>
		{/if}
	</PanelSection>

	<PanelSection>
		<RunReport {patcher} {report} />
	</PanelSection>

	<PanelSection class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
		<Button variant="ghost" onclick={() => patcher.clearApp()}>Patch another app</Button>
		<Button variant="outlined" onclick={() => patcher.edit()}>Change patches</Button>
	</PanelSection>
</Panel>
