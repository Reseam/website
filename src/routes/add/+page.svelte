<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
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

<PageMeta title={m.add_meta_title()} description={m.add_meta_description()} noindex />

<div class="container-page">
	<div class="mx-auto grid max-w-176 gap-6 pt-10 pb-20 sm:pt-14">
		<h1 class="text-headline-large sm:text-display-medium">{m.add_title()}</h1>

		{#if link === null}
			<Panel>
				<PanelHeader
					icon={TriangleAlert}
					tone="error"
					title={m.add_incomplete_title()}
					subtitle={m.add_incomplete_text()}
				/>
			</Panel>
		{:else if link}
			<Panel>
				<PanelHeader icon={Layers} title={link.host} subtitle={m.add_source_subtitle()} />
				<PanelSection class="grid gap-3">
					<p class="text-label-medium text-on-surface-variant">{m.add_link()}</p>
					<div
						class="flex min-w-0 items-center gap-3 rounded-lg border border-outline-variant bg-surface-container px-4 py-2"
					>
						<LinkIcon size={16} class="shrink-0 text-on-surface-variant" />
						<p class="min-w-0 flex-1 truncate font-mono text-body-medium" title={link.url}>
							{link.url}
						</p>
						<Button variant="ghost" size="sm" onclick={() => copy(link!.url)}>
							{#if copied}<Check size={16} /> {m.action_copied()}{:else}<Copy size={16} />
								{m.action_copy()}{/if}
						</Button>
					</div>
				</PanelSection>
				<PanelSection class="grid gap-4">
					{#if android}
						<p class="text-body-medium text-on-surface-variant">
							{m.add_preview()}
						</p>
						<div class="flex flex-wrap gap-3">
							<Button href={managerIntent(link.url)} size="lg">{m.add_open()}</Button>
							<Button href={localizeHref('/download/')} size="lg" variant="outline"
								><Download size={17} /> {m.action_get_manager()}</Button
							>
						</div>
					{:else}
						<ol class="grid list-decimal gap-2 ps-5 text-body-medium">
							<li>{m.add_step_copy()}</li>
							<li>{m.add_step_open()}</li>
							<li>{m.add_step_paste()}</li>
						</ol>
						<Button
							href={localizeHref('/download/')}
							size="lg"
							variant="outline"
							class="justify-self-start"><Download size={17} /> {m.action_get_manager()}</Button
						>
					{/if}
				</PanelSection>
			</Panel>
			<Callout icon={ShieldAlert}>
				{m.add_trust()}
			</Callout>
		{/if}
	</div>
</div>
