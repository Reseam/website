<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import { cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import ActionBar from '#lib/components/patcher/ActionBar.svelte';
	import AppPanel from '#lib/components/patcher/AppPanel.svelte';
	import Done from '#lib/components/patcher/Done.svelte';
	import DropZone from '#lib/components/patcher/DropZone.svelte';
	import Failed from '#lib/components/patcher/Failed.svelte';
	import KeyDialog from '#lib/components/patcher/KeyDialog.svelte';
	import PatchList from '#lib/components/patcher/PatchList.svelte';
	import Progress from '#lib/components/patcher/Progress.svelte';
	import Sources from '#lib/components/patcher/Sources.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Callout from '#lib/components/ui/Callout.svelte';
	import Panel from '#lib/components/ui/Panel.svelte';
	import PanelHeader from '#lib/components/ui/PanelHeader.svelte';
	import { capability, Patcher } from '#lib/patcher/patcher.svelte.ts';

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

	const phase = $derived(patcher?.phase);
	const enter = { y: 8, duration: 250, easing: cubicOut };
</script>

<PageMeta
	title="Patch an app · Reseam"
	description="Patch Android apps in your browser when you can't install Reseam Manager. Your files stay on your device."
/>

<div class="container-page">
	<div class="mx-auto grid max-w-232 grid-cols-1 gap-6 pt-10 pb-6 sm:pt-14">
		<header class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<h1 class="text-title font-bold">Patch an app</h1>
				<p class="mt-3 text-muted-foreground">
					Runs in this browser. It's slower than Reseam Manager, and your files stay on this device.
				</p>
			</div>
			{#if patcher}
				<Button
					variant="outline"
					onclick={() => (keyOpen = true)}
					disabled={phase?.name === 'patching'}
				>
					<KeyRound size={16} /> Signing key
				</Button>
			{/if}
		</header>

		{#if unsupported || failure}
			<Panel>
				<PanelHeader
					icon={CircleAlert}
					tone="error"
					title={unsupported ? "This browser can't patch apps" : 'The patcher could not start'}
					subtitle={unsupported ?? failure ?? undefined}
				>
					{#snippet aside()}<Button href="/download/" size="sm">Get Reseam Manager</Button
						>{/snippet}
				</PanelHeader>
			</Panel>
		{:else if !patcher || !phase}
			<div
				class="h-72 animate-pulse rounded-xl bg-card"
				aria-label="Loading the patcher"
				role="status"
			></div>
		{:else}
			{#key phase.name === 'reading' ? 'ready' : phase.name}
				<div in:fly={enter} class="grid grid-cols-1 gap-6">
					{#if phase.name === 'patching'}
						<Progress {patcher} {...phase} />
					{:else if phase.name === 'done'}
						<Done {patcher} {...phase} />
					{:else if phase.name === 'failed'}
						<Failed {patcher} {...phase} />
					{:else}
						{#if patcher.notice}
							<div role="status">
								<Callout icon={CircleAlert} tone="warning">{patcher.notice}</Callout>
							</div>
						{/if}
						{#if patcher.input}
							<AppPanel {patcher} file={patcher.input.app} />
						{:else}
							<DropZone onfiles={(files) => patcher!.choose(files)} />
						{/if}
						<div><Sources {patcher} /></div>
						{#if phase.name === 'ready'}
							<PatchList {patcher} />
							<ActionBar {patcher} />
						{/if}
					{/if}
				</div>
			{/key}
		{/if}

		<!-- The CheerpJ Community License asks for credit. -->
		<p class="py-6 text-center text-xs text-muted-foreground">
			Powered by <a
				href="https://cheerpj.com/"
				rel="noopener noreferrer"
				class="underline-offset-2 hover:text-foreground hover:underline">CheerpJ</a
			>
		</p>
	</div>
</div>

{#if patcher}<KeyDialog {patcher} bind:open={keyOpen} />{/if}
