<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import Download from '@lucide/svelte/icons/download';
	import Layers from '@lucide/svelte/icons/layers';
	import LinkIcon from '@lucide/svelte/icons/link';
	import ShieldAlert from '@lucide/svelte/icons/shield-alert';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { onMount } from 'svelte';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Callout from '#lib/components/ui/Callout.svelte';
	import Panel from '#lib/components/ui/Panel.svelte';
	import PanelHeader from '#lib/components/ui/PanelHeader.svelte';
	import PanelSection from '#lib/components/ui/PanelSection.svelte';
	import { managerIntent, sourceLink, type SourceLink } from '#lib/add-source.ts';

	// The page is prerendered, so the link in its query is only readable in the browser.
	let link = $state<SourceLink | null>();
	let android = $state(false);
	let copied = $state(false);

	onMount(() => {
		link = sourceLink(new URL(location.href).searchParams.get('url'));
		android = /Android/i.test(navigator.userAgent);
	});

	async function copy(url: string) {
		await navigator.clipboard.writeText(url);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<PageMeta
	title="Add patch source · Reseam"
	description="Add a patch source to Reseam Manager."
	noindex
/>

<div class="container-page">
	<div class="mx-auto grid max-w-176 gap-6 pt-10 pb-20 sm:pt-14">
		<h1 class="text-headline-large sm:text-display-medium">Add patch source</h1>

		{#if link === null}
			<Panel>
				<PanelHeader
					icon={TriangleAlert}
					tone="error"
					title="This link is incomplete"
					subtitle="It doesn't say which patch source to add. Ask whoever shared it for the full link."
				/>
			</Panel>
		{:else if link}
			<Panel>
				<PanelHeader icon={Layers} title={link.host} subtitle="Patch source for Reseam Manager" />
				<PanelSection class="grid gap-3">
					<p class="text-label-medium text-on-surface-variant">Link</p>
					<div
						class="flex min-w-0 items-center gap-3 rounded-lg border border-outline-variant bg-surface-container px-4 py-2"
					>
						<LinkIcon size={16} class="shrink-0 text-on-surface-variant" />
						<p class="min-w-0 flex-1 truncate font-mono text-body-medium" title={link.url}>
							{link.url}
						</p>
						<Button variant="ghost" size="sm" onclick={() => copy(link!.url)}>
							{#if copied}<Check size={16} /> Copied{:else}<Copy size={16} /> Copy{/if}
						</Button>
					</div>
				</PanelSection>
				<PanelSection class="grid gap-4">
					{#if android}
						<p class="text-body-medium text-on-surface-variant">
							Reseam Manager shows what the source patches before adding anything.
						</p>
						<div class="flex flex-wrap gap-3">
							<Button href={managerIntent(link.url)} size="lg">Open in Reseam Manager</Button>
							<Button href="/download/" size="lg" variant="outline"
								><Download size={17} /> Get Reseam Manager</Button
							>
						</div>
					{:else}
						<ol class="grid list-decimal gap-2 ps-5 text-body-medium">
							<li>Copy the link above.</li>
							<li>In Reseam Manager, open Settings › Patch sources › Add patch source.</li>
							<li>Paste the link and choose Add.</li>
						</ol>
						<Button href="/download/" size="lg" variant="outline" class="justify-self-start"
							><Download size={17} /> Get Reseam Manager</Button
						>
					{/if}
				</PanelSection>
			</Panel>
			<Callout icon={ShieldAlert}>
				Only add patch sources from people you trust. Their patches run inside the apps you patch.
			</Callout>
		{/if}
	</div>
</div>
