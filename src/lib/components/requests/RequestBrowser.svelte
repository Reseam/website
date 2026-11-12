<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import Inbox from '@lucide/svelte/icons/inbox';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
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
		<SearchField bind:value={query} label={m.requests_search()} />
	</div>
	<Segmented
		label={m.requests_sort()}
		value={sort}
		options={[
			{ value: 'top', label: m.requests_sort_top() },
			{ value: 'new', label: m.requests_sort_new() },
		]}
		onchange={(next) => (sort = next)}
	/>
</div>
<FilterChips
	label={m.requests_status()}
	bind:value={status}
	options={Object.entries(STATUSES).map(([value, label]) => ({ value, label: label() }))}
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
	<EmptyState icon={Inbox}>
		<p>{board.requests.length === 0 ? m.requests_none() : m.requests_no_match()}</p>
	</EmptyState>
{/if}
{#if failed}
	<p role="status" class="text-body-medium text-on-surface-variant">
		{m.requests_stale()}
	</p>
{/if}
{#if !canWrite}
	<p class="text-body-medium text-on-surface-variant">{m.requests_read_only()}</p>
{/if}
