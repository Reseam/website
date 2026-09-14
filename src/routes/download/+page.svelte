<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { Download, CircleAlert as AlertCircle, Smartphone } from 'lucide-svelte';
	import Button from '$lib/components/Button.svelte';
	import { fetchLatestManager } from '$lib/api';
	import { detectPlatform, managerDownloads } from '$lib/downloads';
	import { settings } from '$lib/settings.svelte';

	const page = $derived(Promise.all([fetchLatestManager(settings.apiUrl), detectPlatform()]));
</script>

<svelte:head>
	<title>Download · Reseam</title>
	<meta
		name="description"
		content="Get the Reseam Manager for Android or Linux to browse and apply patches to your apps."
	/>
</svelte:head>

<div class="container mx-auto px-6 py-20 max-w-2xl">
	<div in:fly={{ y: 10, duration: 400, easing: cubicOut }}>
		<h1 class="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Download the App</h1>
		<p class="text-lg text-muted-foreground mb-12">
			Get the Reseam Manager to easily browse and select features you want to add to your phone.
		</p>

		{#await page}
			<div class="animate-pulse h-64 bg-muted rounded-[1.5rem]"></div>
		{:then [{ bundle, release }, platform]}
			{@const downloads = managerDownloads(settings.apiUrl, release.version)}
			{@const apk = downloads.android[platform.os === 'android' ? platform.abi : 'arm64-v8a']}
			<div
				class="bg-card border border-border shadow-sm rounded-[1.5rem] p-6 sm:p-10 flex flex-col items-center text-center"
			>
				<div class="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
					<Smartphone class="text-primary" size={40} />
				</div>

				<h2 class="text-2xl font-bold mb-2">{bundle.name}</h2>
				<span
					class="inline-block bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-medium mb-6"
				>
					Version {release.version}
				</span>

				{#if release.description || bundle.description}
					<p class="text-muted-foreground mb-6 max-w-md">
						{release.description || bundle.description}
					</p>
				{/if}

				{#if platform.os === 'linux'}
					<div class="grid w-full gap-3 mt-4 sm:grid-cols-3">
						{#each downloads.linux as build (build.url)}
							<Button
								href={build.url}
								size="lg"
								class="h-auto flex-col gap-1 rounded-[1rem] py-4 shadow-sm"
							>
								<span class="inline-flex items-center">
									<Download size={18} class="mr-2" />
									{build.name}
								</span>
								<span class="text-xs font-normal opacity-70">{build.detail}</span>
							</Button>
						{/each}
					</div>
				{:else}
					<Button
						href={apk.url}
						size="lg"
						class="w-full mt-4 text-lg rounded-[1rem] py-6 shadow-sm"
					>
						<Download size={22} class="mr-2" />
						Download for Android
					</Button>
					<p class="text-sm text-muted-foreground mt-3">APK for {apk.detail}</p>
				{/if}

				<details class="group w-full mt-10 text-left">
					<summary
						class="cursor-pointer select-none text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						All downloads
					</summary>
					<ul class="mt-4 divide-y divide-border border border-border rounded-[1rem]">
						{#each [...Object.values(downloads.android), ...downloads.linux] as build (build.url)}
							<li>
								<a
									href={build.url}
									class="flex items-center justify-between gap-4 px-4 py-3 hover:bg-accent transition-colors first:rounded-t-[1rem] last:rounded-b-[1rem]"
								>
									<span class="min-w-0">
										<span class="block font-medium">{build.name}</span>
										<span class="block text-sm text-muted-foreground">{build.detail}</span>
									</span>
									<Download size={18} class="shrink-0 text-muted-foreground" />
								</a>
							</li>
						{/each}
					</ul>
				</details>
			</div>
		{:catch}
			<div
				class="p-6 bg-destructive/10 text-destructive border border-destructive/20 rounded-[1.5rem] flex items-center gap-4"
			>
				<AlertCircle size={20} />
				<p>We couldn't connect right now. Please try again.</p>
			</div>
		{/await}
	</div>
</div>
