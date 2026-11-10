<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
	import KeyRound from '@lucide/svelte/icons/key-round';
	import SquareTerminal from '@lucide/svelte/icons/square-terminal';
	import { onMount } from 'svelte';
	import { fetchManager } from '#lib/api.ts';
	import DownloadRow from '#lib/components/download/DownloadRow.svelte';
	import Logo from '#lib/components/layout/Logo.svelte';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Panel from '#lib/components/ui/Panel.svelte';
	import PanelHeader from '#lib/components/ui/PanelHeader.svelte';
	import PanelSection from '#lib/components/ui/PanelSection.svelte';
	import { managerBuilds, suggestedBuilds, type Suggestion } from '#lib/downloads.ts';
	import { fresh } from '#lib/fresh.svelte.ts';
	import { shortDate } from '#lib/format.ts';
	import { settings } from '#lib/settings.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';

	let { data } = $props();

	const manager = fresh(() => data.manager, fetchManager);
	const version = $derived(manager.value.release.version);
	const builds = $derived(managerBuilds(settings.apiUrl, version));

	// Prerendered pages suggest the common phone build until the browser says what it runs on.
	let suggestion = $state<Suggestion>({
		ids: ['android-arm64-v8a'],
		highlight: 'android-arm64-v8a',
	});
	onMount(async () => (suggestion = await suggestedBuilds()));

	const main = $derived(suggestion.ids.map((id) => builds.find((build) => build.id === id)!));
	const others = $derived(builds.filter((build) => !suggestion.ids.includes(build.id)));
</script>

<PageMeta title={m.download_meta_title()} description={m.download_meta_description()} />

{#snippet logo()}<Logo class="size-7" />{/snippet}

<div class="container-page">
	<div class="mx-auto grid max-w-232 gap-6 pt-10 pb-20 sm:pt-14">
		<h1 class="text-headline-large sm:text-display-medium">{m.download_title()}</h1>

		<Panel>
			<PanelHeader
				tile={logo}
				title="Reseam Manager"
				subtitle={m.download_released({
					version,
					date: shortDate(manager.value.release.created_at),
				})}
			/>
			<PanelSection class="grid gap-3">
				<p class="text-title-medium">{main[0].platform}</p>
				{#each main as build (build.id)}
					<div class="flex flex-wrap items-center gap-4">
						<p class="min-w-48 flex-1 text-body-medium text-on-surface-variant">{build.detail}</p>
						<Button
							href={build.url}
							size="lg"
							variant={build.id === suggestion.highlight ? 'primary' : 'outline'}
							><Download size={17} /> {m.action_download()}</Button
						>
					</div>
				{/each}
				{#if main[0].platform === 'Android'}
					<p class="text-body-medium text-on-surface-variant">
						{m.download_android_installs()}
					</p>
				{/if}
			</PanelSection>
			<PanelSection class="grid gap-3">
				<p class="text-label-medium text-on-surface-variant">{m.download_other()}</p>
				<ul
					class="divide-y divide-outline-variant overflow-hidden rounded-lg border border-outline-variant"
				>
					{#each others as build (build.id)}<DownloadRow
							title={build.platform}
							detail={build.detail}
							href={build.url}
						/>{/each}
				</ul>
			</PanelSection>
		</Panel>

		<Panel labelledby="gmscore">
			<PanelHeader
				id="gmscore"
				icon={KeyRound}
				title="GmsCore"
				subtitle={m.download_released({
					version: data.gmscore.version,
					date: shortDate(data.gmscore.publishedAt),
				})}
			/>
			<PanelSection class="grid gap-3">
				<p class="text-body-medium text-on-surface-variant">
					{m.download_gmscore_text()}
				</p>
				<ul
					class="divide-y divide-outline-variant overflow-hidden rounded-lg border border-outline-variant"
				>
					{#each data.gmscore.builds as build (build.url)}<DownloadRow
							title={build.title}
							detail={build.variant === 'huawei'
								? m.download_gmscore_huawei()
								: m.download_gmscore_standard()}
							href={build.url}
						/>{/each}
				</ul>
			</PanelSection>
		</Panel>

		<Panel>
			<PanelHeader
				icon={SquareTerminal}
				title="Reseam CLI"
				subtitle={m.download_cli_released({
					version: data.cli.version,
					date: shortDate(data.cli.publishedAt),
				})}
			/>
			<PanelSection class="grid gap-3">
				<ul
					class="divide-y divide-outline-variant overflow-hidden rounded-lg border border-outline-variant"
				>
					{#each data.cli.builds as build (build.url)}<DownloadRow
							title={build.platform}
							detail={m.download_cli_detail()}
							href={build.url}
						/>{/each}
				</ul>
				<p class="text-body-medium text-on-surface-variant">{m.download_cli_java()}</p>
			</PanelSection>
			<PanelSection class="flex flex-wrap items-center justify-between gap-3 py-4 text-body-medium">
				<span class="text-on-surface-variant">{m.download_cli_new()}</span>
				<span class="flex gap-5">
					<a
						href={localizeHref('/docs/cli/install/')}
						class="text-label-large transition-colors hover:text-primary"
						>{m.download_cli_guide()}</a
					>
					<a
						href={data.cli.releasesUrl}
						class="text-label-large transition-colors hover:text-primary"
						>{m.download_cli_releases()}</a
					>
				</span>
			</PanelSection>
		</Panel>
	</div>
</div>
