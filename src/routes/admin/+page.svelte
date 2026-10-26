<script lang="ts">
	import { Label } from 'bits-ui';
	import { adminApi } from '#lib/admin.ts';
	import AnnouncementsAdmin from '#lib/components/admin/AnnouncementsAdmin.svelte';
	import RequestEditor from '#lib/components/admin/RequestEditor.svelte';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import FilterChips from '#lib/components/ui/FilterChips.svelte';
	import Segmented from '#lib/components/ui/Segmented.svelte';
	import { STATUSES } from '#lib/requests.svelte.ts';
	import { settings } from '#lib/settings.svelte.ts';
	import type { PatchRequest } from '#lib/types.ts';

	const TOKEN_KEY = 'reseam.adminToken';

	let token = $state('');
	let draft = $state('');
	let tab = $state<'requests' | 'announcements'>('requests');
	let requests = $state.raw<PatchRequest[]>([]);
	let status = $state('hidden');
	let error = $state('');

	$effect(() => {
		token = localStorage.getItem(TOKEN_KEY) ?? '';
	});

	const api = $derived(token ? adminApi(settings.apiUrl, token) : undefined);

	$effect(() => {
		if (!api) return;
		error = '';
		api.requests().then(
			(list) => (requests = list),
			(failure) => (error = failure.message)
		);
	});

	const shown = $derived(requests.filter((request) => !status || request.status === status));

	function signIn(event: SubmitEvent) {
		event.preventDefault();
		localStorage.setItem(TOKEN_KEY, draft.trim());
		token = draft.trim();
		draft = '';
	}

	function signOut() {
		localStorage.removeItem(TOKEN_KEY);
		token = '';
	}
</script>

<PageMeta title="Admin · Reseam" description="Moderate requests and post announcements." noindex />

<div class="container-page">
	<div class="mx-auto grid max-w-232 gap-6 pt-10 pb-20 sm:pt-14">
		<header class="flex flex-wrap items-center justify-between gap-4">
			<h1 class="text-headline-large">Admin</h1>
			{#if api}
				<div class="flex items-center gap-3">
					<Segmented
						label="Section"
						value={tab}
						options={[
							{ value: 'requests', label: 'Requests' },
							{ value: 'announcements', label: 'Announcements' },
						]}
						onchange={(next) => (tab = next)}
					/>
					<Button variant="ghost" onclick={signOut}>Forget token</Button>
				</div>
			{/if}
		</header>

		{#if !api}
			<form onsubmit={signIn} class="grid max-w-md gap-3">
				<Label.Root for="admin-token" class="text-label-large">Admin token</Label.Root>
				<input
					id="admin-token"
					type="password"
					bind:value={draft}
					autocomplete="off"
					class="field"
				/>
				<p class="text-body-medium text-on-surface-variant">
					The API's <code>ADMIN_TOKEN</code> for {settings.apiUrl}. Kept in this browser only.
				</p>
				<Button type="submit" class="justify-self-start" disabled={!draft.trim()}>Continue</Button>
			</form>
		{:else if tab === 'announcements'}
			<AnnouncementsAdmin {api} />
		{:else}
			<FilterChips
				label="Status"
				bind:value={status}
				options={[
					{ value: 'hidden', label: 'Hidden' },
					...Object.entries(STATUSES).map(([value, label]) => ({ value, label })),
				]}
			/>
			{#if error}<p class="text-body-medium text-error" role="alert">{error}</p>{/if}
			<ul
				class="divide-y divide-outline-variant overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low"
			>
				{#each shown as request (request.id)}
					<RequestEditor
						{request}
						{api}
						onchange={(next) => (requests = requests.map((r) => (r.id === next.id ? next : r)))}
						onremove={() => api.requests().then((list) => (requests = list))}
					/>
				{:else}
					<li class="px-6 py-10 text-center text-on-surface-variant">Nothing here.</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
