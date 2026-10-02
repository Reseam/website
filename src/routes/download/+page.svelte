<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { Download, CircleAlert as AlertCircle, Smartphone, Terminal } from 'lucide-svelte';
	import PageMeta from '$lib/components/PageMeta.svelte';
	import { fetchLatestManager } from '$lib/api';
	import { detectPlatform, managerDownloads, type Platform } from '$lib/downloads';
	import { settings } from '$lib/settings.svelte';
	import { relTime, fullTime } from '$lib/format';
	import type { ReleaseResponse } from '$lib/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// The API URL and the platform are only known in the browser.
	let manager = $state<Promise<[ReleaseResponse, Platform]>>();
	$effect(() => {
		manager = Promise.all([fetchLatestManager(settings.apiUrl), detectPlatform()]);
	});
</script>

<PageMeta
	title="Download · Reseam"
	description="Download Reseam Manager for Android, Linux, or Windows, or the Reseam CLI for Linux and Windows."
/>

{#snippet downloadLink(build: { name: string; url: string }, detail = '', outlined = false)}
	<a
		href={build.url}
		class="flex min-h-16 min-w-0 items-center justify-between gap-4 rounded-xl border px-4 py-3 text-sm font-medium transition-colors {outlined
			? 'border-border hover:bg-accent'
			: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/90'}"
	>
		<span class="min-w-0 text-left">
			<span class="block leading-snug">{build.name}</span>
			{#if detail}
				<span
					class="mt-1 block text-xs font-normal leading-snug {outlined
						? 'text-muted-foreground'
						: 'opacity-70'}">{detail}</span
				>
			{/if}
		</span>
		<Download size={18} class="shrink-0" />
	</a>
{/snippet}

{#snippet loading()}
	<div class="animate-pulse h-64 bg-muted rounded-xl m-6 sm:m-8"></div>
{/snippet}

<div class="mx-auto max-w-6xl px-6 py-12 sm:py-16">
	<div in:fly={{ y: 10, duration: 400, easing: cubicOut }}>
		<h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-8">Download Reseam</h1>

		<div
			class="bg-card border border-border rounded-[1.5rem] divide-y divide-border overflow-hidden"
		>
			{#if !manager}
				{@render loading()}
			{:else}
				{#await manager}
					{@render loading()}
				{:then [{ bundle, release }, platform]}
					{@const downloads = managerDownloads(settings.apiUrl, release.version)}
					{@const apk = downloads.android[platform.os === 'android' ? platform.abi : 'arm64-v8a']}
					<section
						aria-labelledby="manager-heading"
						class="grid gap-6 p-6 sm:p-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10"
					>
						<div>
							<div class="flex items-center gap-3 mb-3">
								<Smartphone class="text-primary shrink-0" size={24} />
								<h2 id="manager-heading" class="text-2xl font-bold">{bundle.name}</h2>
							</div>
							<p class="text-sm text-muted-foreground">
								v{release.version} ·
								<time datetime={release.created_at} title={fullTime(release.created_at)}
									>{relTime(release.created_at)}</time
								>
							</p>
							<a
								href={release.download_url}
								class="inline-block mt-4 text-sm text-primary hover:underline">Release notes</a
							>
						</div>
						<div class="min-w-0 space-y-5">
							<div class="grid gap-3 sm:grid-cols-2">
								{#each [apk, downloads.windows] as build (build.url)}
									{@render downloadLink(
										build,
										build.name === 'Android'
											? 'APK · ' + (platform.os === 'android' ? platform.abi : 'arm64-v8a')
											: 'x64 · .exe'
									)}
								{/each}
							</div>
							<div>
								<h3 class="text-sm font-medium text-muted-foreground mb-2">Linux x64</h3>
								<div class="grid gap-3 sm:grid-cols-3">
									{#each downloads.linux as build (build.url)}
										{@render downloadLink(build, build.detail, true)}
									{/each}
								</div>
							</div>
							<details>
								<summary class="cursor-pointer select-none text-sm text-primary hover:underline"
									>Other Android builds</summary
								>
								<ul class="mt-3 divide-y divide-border">
									{#each Object.entries(downloads.android).filter(([, build]) => build.url !== apk.url) as [abi, build] (abi)}
										<li>
											<a
												href={build.url}
												class="flex items-center justify-between gap-4 py-3 text-sm hover:text-primary"
												><span
													>{abi}<span class="block text-xs text-muted-foreground"
														>{build.detail}</span
													></span
												><Download size={16} class="shrink-0" /></a
											>
										</li>
									{/each}
								</ul>
							</details>
						</div>
					</section>
				{:catch}
					<div class="p-6 sm:p-8 flex items-center gap-4 text-destructive">
						<AlertCircle size={20} class="shrink-0" />
						<p>
							Couldn't load Manager downloads. <a
								href="https://git.reseam.app/reseam/manager/releases"
								class="underline">Browse releases</a
							>.
						</p>
					</div>
				{/await}
			{/if}

			<section
				aria-labelledby="cli-heading"
				class="grid gap-6 p-6 sm:p-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10"
			>
				<div>
					<div class="flex items-center gap-3 mb-3">
						<Terminal class="text-primary shrink-0" size={24} />
						<h2 id="cli-heading" class="text-2xl font-bold">Reseam CLI</h2>
					</div>
					<p class="text-sm text-muted-foreground">
						{data.cli.version} ·
						<time datetime={data.cli.publishedAt} title={fullTime(data.cli.publishedAt)}
							>{relTime(data.cli.publishedAt)}</time
						>
					</p>
					<a
						href={data.cli.releaseUrl}
						class="inline-block mt-4 text-sm text-primary hover:underline">Release notes</a
					>
				</div>
				<div class="min-w-0">
					<div class="grid gap-3 sm:grid-cols-2">
						{#each data.cli.downloads as build (build.url)}
							{@render downloadLink(build)}
						{/each}
					</div>
					<p class="text-sm text-muted-foreground mt-3">Requires 64-bit Java 17 or newer.</p>
					<div class="flex flex-wrap gap-x-6 gap-y-3 mt-5 text-sm">
						<a href="/docs/cli/install/" class="text-primary hover:underline">Installation guide</a>
						<a href={data.cli.releasesUrl} class="text-primary hover:underline">All CLI releases</a>
					</div>
				</div>
			</section>
		</div>
	</div>
</div>
