<script lang="ts">
	import Download from '@lucide/svelte/icons/download';
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
	import { managerBuilds, preferredBuild } from '#lib/downloads.ts';
	import { fresh } from '#lib/fresh.svelte.ts';
	import { shortDate } from '#lib/format.ts';
	import { settings } from '#lib/settings.svelte.ts';

	let { data } = $props();

	const manager = fresh(() => data.manager, fetchManager);
	const version = $derived(manager.value.release.version);
	const builds = $derived(managerBuilds(settings.apiUrl, version));

	// Prerendered pages suggest the common phone build until the browser says what it runs on.
	let preferred = $state('android-arm64-v8a');
	onMount(async () => (preferred = await preferredBuild()));

	const main = $derived(builds.find((build) => build.id === preferred)!);
	const others = $derived(builds.filter((build) => build !== main));
</script>

<PageMeta
	title="Download · Reseam"
	description="Download Reseam Manager for Android, Windows and Linux, or the Reseam CLI."
/>

{#snippet logo()}<Logo class="size-7" />{/snippet}

<div class="container-page">
	<div class="mx-auto grid max-w-232 gap-6 pt-10 pb-20 sm:pt-14">
		<h1 class="text-title font-bold">Download</h1>

		<Panel>
			<PanelHeader
				tile={logo}
				title="Reseam Manager"
				subtitle="Version {version} · Released {shortDate(manager.value.release.created_at)}"
			/>
			<PanelSection class="grid gap-3">
				<div class="flex flex-wrap items-center gap-4">
					<div class="min-w-48 flex-1">
						<p class="font-semibold">{main.platform}</p>
						<p class="text-sm text-muted-foreground">{main.detail}</p>
					</div>
					<Button href={main.url} size="lg"><Download size={17} /> Download</Button>
				</div>
				{#if main.platform === 'Android'}
					<p class="text-sm text-muted-foreground">
						Your phone may ask you to allow installs from your browser.
					</p>
				{/if}
			</PanelSection>
			<PanelSection class="grid gap-3">
				<p class="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
					Other downloads
				</p>
				<ul class="divide-y divide-border overflow-hidden rounded-lg border border-border">
					{#each others as build (build.id)}<DownloadRow
							title={build.platform}
							detail={build.detail}
							href={build.url}
						/>{/each}
				</ul>
			</PanelSection>
		</Panel>

		<Panel>
			<PanelHeader
				icon={SquareTerminal}
				title="Reseam CLI"
				subtitle="Version {data.cli.version} · Released {shortDate(
					data.cli.publishedAt
				)} · For patch authors"
			/>
			<PanelSection class="grid gap-3">
				<ul class="divide-y divide-border overflow-hidden rounded-lg border border-border">
					{#each data.cli.builds as build (build.url)}<DownloadRow
							title={build.platform}
							detail="64-bit"
							href={build.url}
						/>{/each}
				</ul>
				<p class="text-sm text-muted-foreground">Needs 64-bit Java 17 or newer.</p>
			</PanelSection>
			<PanelSection class="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
				<span class="text-muted-foreground">New to the CLI?</span>
				<span class="flex gap-5">
					<a href="/docs/cli/install/" class="font-medium transition-colors hover:text-primary"
						>Install guide</a
					>
					<a href={data.cli.releasesUrl} class="font-medium transition-colors hover:text-primary"
						>All releases</a
					>
				</span>
			</PanelSection>
		</Panel>
	</div>
</div>
