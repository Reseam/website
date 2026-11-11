<script lang="ts">
	import '../app.css';
	import { Tooltip } from 'bits-ui';
	import { onMount } from 'svelte';
	import { beforeNavigate, onNavigate } from '$app/navigation';
	import { fetchAnnouncements } from '#lib/api.ts';
	import { newestFirst } from '#lib/announcements.ts';
	import { reading } from '#lib/announcements.svelte.ts';
	import AnnouncementBar from '#lib/components/layout/AnnouncementBar.svelte';
	import Footer from '#lib/components/layout/Footer.svelte';
	import Header from '#lib/components/layout/Header.svelte';
	import { fresh } from '#lib/fresh.svelte.ts';
	import { deLocalizeUrl } from '#lib/paraglide/runtime.js';

	let { data, children } = $props();

	const latest = fresh(
		() => data.latest,
		async (apiUrl) => newestFirst(await fetchAnnouncements(apiUrl))[0] ?? null
	);

	onMount(reading.restore);

	// The patcher page is cross-origin isolated, which only a full page load can switch on or off.
	const isolated = (url: URL) => deLocalizeUrl(url).pathname.startsWith('/patch/');
	beforeNavigate(({ from, to, cancel, type }) => {
		if (type !== 'link' || !from || !to) return;
		if (isolated(from.url) === isolated(to.url)) return;
		cancel();
		location.href = to.url.href;
	});

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<Tooltip.Provider delayDuration={300}>
	<div class="flex min-h-dvh flex-col">
		{#if latest.value}<AnnouncementBar announcement={latest.value} />{/if}
		<Header unread={latest.value ? reading.isNew(latest.value.id) : false} />
		<main class="flex flex-1 flex-col">{@render children()}</main>
		<Footer />
	</div>
</Tooltip.Provider>
