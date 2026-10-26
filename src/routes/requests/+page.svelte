<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import { onMount } from 'svelte';
	import { TURNSTILE_SITE_KEY } from '$app/env/public';
	import { afterNavigate, goto } from '$app/navigation';
	import { storedAdminApi, type AdminApi } from '#lib/admin.ts';
	import { appNames } from '#lib/apps.svelte.ts';
	import AppList from '#lib/components/patches/AppList.svelte';
	import NewRequestDialog from '#lib/components/requests/NewRequestDialog.svelte';
	import RequestBrowser from '#lib/components/requests/RequestBrowser.svelte';
	import RequestComments from '#lib/components/requests/RequestComments.svelte';
	import RequestDetail from '#lib/components/requests/RequestDetail.svelte';
	import RequestNotices from '#lib/components/requests/RequestNotices.svelte';
	import VerifyDialog from '#lib/components/requests/VerifyDialog.svelte';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { fresh } from '#lib/fresh.svelte.ts';
	import { RequestBoard } from '#lib/request-board.svelte.ts';
	import { matchingRequests, requestApps, type RequestSort } from '#lib/request-list.ts';
	import { fetchRequests, voterFor } from '#lib/requests.svelte.ts';
	import { settings } from '#lib/settings.svelte.ts';

	let { data } = $props();

	const canWrite = TURNSTILE_SITE_KEY !== '';
	const list = fresh(
		() => data.requests,
		(apiUrl) => fetchRequests(apiUrl)
	);
	const board = new RequestBoard(() => list.value, voterFor(settings.apiUrl));
	let admin = $state<AdminApi>();
	onMount(() => {
		board.loadActivity();
		admin = storedAdminApi(settings.apiUrl);
	});

	// Prerendered pages hydrate without their query, so ?id= and ?app= are read once the page runs.
	let params = $state(new URLSearchParams());
	afterNavigate(() => (params = new URLSearchParams(location.search)));
	const linkedApp = $derived(params.get('app'));
	const selected = $derived(
		board.requests.find((request) => request.id === Number(params.get('id')))
	);

	let query = $state('');
	let status = $state('');
	let sort = $state<RequestSort>('top');
	let app = $state<string | null | undefined>();
	$effect(() => {
		if (linkedApp) app = linkedApp;
	});
	let creating = $state(false);
	let held = $state(false);

	const names = appNames(
		() => data.apps,
		() => [...new Set([...data.packages, ...board.requests.flatMap((r) => (r.app ? [r.app] : []))])]
	);
	const matching = $derived(matchingRequests(board.requests, query, status, sort));
	const shown = $derived(matching.filter((request) => app === undefined || request.app === app));

	function posted(request: (typeof board.requests)[number]) {
		held = request.status === 'hidden';
		board.posted(request);
		if (!held) goto(`?id=${request.id}`);
	}
</script>

<PageMeta
	title="Requests · Reseam"
	description="Ask for a patch, a fix, or support for an app, and vote on what others asked for."
/>

<div class="container-page">
	<header class="flex flex-wrap items-end justify-between gap-x-8 gap-y-5 pt-10 pb-8 sm:pt-14">
		<div class="grid gap-2">
			<h1 class="text-headline-large sm:text-display-small">Requests</h1>
			<p class="text-body-large text-on-surface-variant">
				Ask for a patch, a fix, or support for an app, and vote on what others asked for. No account
				needed.
			</p>
		</div>
		{#if canWrite}<Button size="lg" onclick={() => (creating = true)}
				><Plus size={18} /> New request</Button
			>{/if}
	</header>

	<div
		class="grid grid-cols-1 items-start gap-6 pb-20 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-14"
	>
		<AppList
			apps={requestApps(matching, names.value)}
			total={matching.length}
			bind:selected={app}
			noneLabel="Other app"
		/>
		<div class="grid min-w-0 gap-5">
			<RequestNotices mine={board.mine()} {held} />
			{#if selected}
				<div class="grid gap-12">
					<RequestDetail
						request={selected}
						app={selected.app ? names.value[selected.app] : undefined}
						duplicateOf={board.requests.find((request) => request.id === selected.duplicate_of)}
						voted={board.voted(selected)}
						canVote={canWrite}
						reported={board.reported.has(selected.id)}
						onvote={() => board.vote(selected)}
						onreport={() => board.report(selected)}
						{admin}
						onchange={(updated) => board.replace(updated)}
						onremove={() => {
							board.remove(selected.id);
							goto('?');
						}}
					/>
					<RequestComments {board} request={selected} apiUrl={settings.apiUrl} {canWrite} {admin} />
				</div>
			{:else}
				<RequestBrowser
					{board}
					{shown}
					names={names.value}
					{canWrite}
					failed={list.failed}
					bind:query
					bind:status
					bind:sort
				/>
			{/if}
		</div>
	</div>
</div>

<VerifyDialog bind:open={board.verifying} onverified={(turnstile) => board.verified(turnstile)} />
<NewRequestDialog
	bind:open={creating}
	apps={data.packages}
	appLabel={(pkg) => names.value[pkg]?.name ?? pkg}
	initialApp={linkedApp}
	voter={board.voter}
	onposted={posted}
	onvote={(request) => goto(`?id=${request.id}`).then(() => board.vote(request))}
/>
