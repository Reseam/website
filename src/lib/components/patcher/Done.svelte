<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Download from '@lucide/svelte/icons/download';
	import FileArchive from '@lucide/svelte/icons/file-archive';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import type { Artifact, PatchResult } from '@reseam/browser';
	import { Collapsible } from 'bits-ui';
	import Button from '#lib/components/ui/Button.svelte';
	import Callout from '#lib/components/ui/Callout.svelte';
	import Panel from '#lib/components/ui/Panel.svelte';
	import PanelHeader from '#lib/components/ui/PanelHeader.svelte';
	import PanelSection from '#lib/components/ui/PanelSection.svelte';
	import { duration, megabytes, plural } from '#lib/format.ts';
	import { keyBackup, save, splitArchive } from '#lib/patcher/files.ts';
	import type { Patcher, Report } from '#lib/patcher/patcher.svelte.ts';
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
	const apkName = (artifact: Artifact) => artifact.name.split('/').at(-1)!;

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
			class="flex flex-col gap-4 rounded-lg border border-border bg-background px-4 py-3.5 sm:flex-row sm:items-center"
		>
			<FileArchive size={20} class="hidden shrink-0 text-muted-foreground sm:block" />
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-medium">{fileName}</p>
				<p class="text-xs text-muted-foreground">
					{megabytes(size)}{split ? ` · ${apks.length} split APKs` : ''}
				</p>
			</div>
			<Button onclick={downloadApp} disabled={preparing}>
				{#if preparing}<LoaderCircle size={16} class="animate-spin" /> Preparing{:else}<Download
						size={16}
					/> Download{/if}
			</Button>
		</div>
		{#if split}
			<p class="text-sm text-muted-foreground">
				Install the .apks file with a split APK installer.
			</p>
			<Collapsible.Root>
				<Collapsible.Trigger
					class="text-sm text-muted-foreground transition-colors hover:text-foreground"
					>Download APKs one by one</Collapsible.Trigger
				>
				<Collapsible.Content class="collapsible">
					<ul class="mt-3 divide-y divide-border rounded-md border border-border text-sm">
						{#each apks as artifact (artifact.name)}
							<li>
								<button
									type="button"
									onclick={() => save(artifact.file, apkName(artifact))}
									class="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted"
								>
									<span class="min-w-0 flex-1 truncate">{apkName(artifact)}</span>
									<span class="text-muted-foreground tabular-nums"
										>{megabytes(artifact.file.size)}</span
									>
									<Download size={14} class="text-muted-foreground" />
								</button>
							</li>
						{/each}
					</ul>
				</Collapsible.Content>
			</Collapsible.Root>
		{/if}
		{#if newKey}
			<Callout icon={KeyRound} title="Back up your signing key">
				<p class="mt-1 text-muted-foreground">
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
