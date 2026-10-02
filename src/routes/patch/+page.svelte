<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { CircleAlert, KeyRound } from 'lucide-svelte';
	import PageMeta from '$lib/components/PageMeta.svelte';
	import Button from '$lib/components/Button.svelte';
	import ActionBar from '$lib/components/patcher/ActionBar.svelte';
	import AppPanel from '$lib/components/patcher/AppPanel.svelte';
	import Callout from '$lib/components/patcher/Callout.svelte';
	import Done from '$lib/components/patcher/Done.svelte';
	import DropZone from '$lib/components/patcher/DropZone.svelte';
	import Failed from '$lib/components/patcher/Failed.svelte';
	import KeyDialog from '$lib/components/patcher/KeyDialog.svelte';
	import PatchList from '$lib/components/patcher/PatchList.svelte';
	import Progress from '$lib/components/patcher/Progress.svelte';
	import Panel from '$lib/components/patcher/Panel.svelte';
	import SourceList from '$lib/components/patcher/SourceList.svelte';
	import { capability, Patcher } from '$lib/patcher/patcher.svelte';

	// Patching needs browser APIs, so the patcher only exists after hydration.
	let patcher = $state<Patcher>();
	let unsupported = $state<string | null>(null);
	let failure = $state<string | null>(null);
	let keyOpen = $state(false);

	$effect(() => {
		unsupported = capability();
		if (unsupported) return;
		const instance = new Patcher();
		patcher = instance;
		instance.start().catch((error) => (failure = String(error)));
		const leave = () => instance.dispose();
		addEventListener('pagehide', leave);
		return () => {
			removeEventListener('pagehide', leave);
			leave();
		};
	});

	const phase = $derived(patcher?.phase.name);
</script>

<PageMeta
	title="Patch an app · Reseam"
	description="Patch Android apps in your browser with Reseam. Your files stay on your device."
/>

<div class="container mx-auto max-w-3xl px-6 pt-12 sm:pt-16">
	<div in:fly={{ y: 10, duration: 400, easing: cubicOut }}>
		<div class="mb-8 flex items-start justify-between gap-4">
			<div>
				<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Patch an app</h1>
				<p class="mt-2 text-muted-foreground">
					Runs in your browser. Your files never leave this device.
				</p>
			</div>
			{#if patcher}
				<Button
					variant="outlined"
					size="sm"
					class="mt-1 shrink-0 gap-2"
					onclick={() => (keyOpen = true)}
					disabled={phase === 'patching'}
				>
					<KeyRound size={15} /> <span class="hidden sm:inline">Signing key</span>
				</Button>
			{/if}
		</div>

		{#if unsupported || failure}
			<div class="flex gap-4 rounded-[1.25rem] border border-border bg-card p-6">
				<CircleAlert size={20} class="mt-0.5 shrink-0 text-error" />
				<div>
					<p>{unsupported ?? failure}</p>
					<p class="mt-2 text-sm text-muted-foreground">
						You can also patch with <a href="/download/" class="text-primary hover:underline"
							>Reseam Manager</a
						>.
					</p>
				</div>
			</div>
		{:else if !patcher}
			<div class="h-64 animate-pulse rounded-[1.25rem] bg-muted"></div>
		{:else if patcher.phase.name === 'patching'}
			<Progress {patcher} {...patcher.phase} />
		{:else if patcher.phase.name === 'done'}
			<Done {patcher} {...patcher.phase} />
		{:else if patcher.phase.name === 'failed'}
			<Failed {patcher} {...patcher.phase} />
		{:else}
			<div class="space-y-4">
				{#if patcher.notice}
					<div role="status">
						<Callout icon={CircleAlert} tone="warning">{patcher.notice}</Callout>
					</div>
				{/if}
				{#if patcher.input}
					<AppPanel {patcher} file={patcher.input.app} />
				{:else}
					<DropZone onfiles={(files) => patcher!.choose(files)} />
					<Panel><SourceList {patcher} /></Panel>
				{/if}
				{#if patcher.phase.name === 'ready'}
					<PatchList {patcher} />
				{/if}
			</div>
			{#if patcher.phase.name === 'ready'}
				<ActionBar {patcher} />
			{/if}
		{/if}

		<!-- The CheerpJ Community License asks for credit. -->
		<p class="py-10 text-center text-xs text-muted-foreground">
			Powered by <a
				href="https://cheerpj.com/"
				rel="noopener noreferrer"
				class="underline-offset-2 hover:text-foreground hover:underline">CheerpJ</a
			>
		</p>
	</div>
</div>

{#if patcher}
	<KeyDialog {patcher} open={keyOpen} onclose={() => (keyOpen = false)} />
{/if}
