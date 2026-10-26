<script lang="ts">
	import Inbox from '@lucide/svelte/icons/inbox';
	import FilterChips from '#lib/components/ui/FilterChips.svelte';
	import SearchField from '#lib/components/ui/SearchField.svelte';
	import Segmented from '#lib/components/ui/Segmented.svelte';
	import type { RequestBoard } from '#lib/request-board.svelte.ts';
	import type { RequestSort } from '#lib/request-list.ts';
	import { STATUSES } from '#lib/requests.svelte.ts';
	import type { AppInfo, PatchRequest } from '#lib/types.ts';
	import RequestRow from './RequestRow.svelte';

	let {
		board,
		shown,
		names,
		canWrite,
		failed,
		query = $bindable(),
		status = $bindable(),
		sort = $bindable(),
	}: {
		board: RequestBoard;
		shown: PatchRequest[];
		names: Record<string, AppInfo>;
		canWrite: boolean;
		failed: boolean;
		query: string;
		status: string;
		sort: RequestSort;
	} = $props();
</script>

<div class="flex flex-wrap items-center gap-3">
	<div class="min-w-0 flex-1 basis-40">
		<SearchField bind:value={query} label="Search requests" />
	</div>
	<Segmented
		label="Sort"
		value={sort}
		options={[
			{ value: 'top', label: 'Top' },
			{ value: 'new', label: 'New' },
		]}
		onchange={(next) => (sort = next)}
	/>
</div>
<FilterChips
	label="Status"
	bind:value={status}
	options={Object.entries(STATUSES).map(([value, label]) => ({ value, label }))}
/>

{#if shown.length > 0}
	<ul
		class="divide-y divide-outline-variant overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low"
	>
		{#each shown as request (request.id)}
			<RequestRow
				{request}
				app={request.app ? names[request.app] : undefined}
				voted={board.voted(request)}
				canVote={canWrite}
				onvote={() => board.vote(request)}
			/>
		{/each}
	</ul>
{:else}
	<div
		class="grid justify-items-center gap-3 rounded-xl border border-dashed border-outline-variant px-6 py-16 text-center text-on-surface-variant"
	>
		<Inbox size={28} class="opacity-40" />
		<p>{board.requests.length === 0 ? 'No requests yet.' : 'No requests match.'}</p>
	</div>
{/if}
{#if failed}
	<p role="status" class="text-body-medium text-on-surface-variant">
		Showing requests from when this site was built. The API at your configured address did not
		answer.
	</p>
{/if}
{#if !canWrite}
	<p class="text-body-medium text-on-surface-variant">Posting and voting are off on this site.</p>
{/if}
