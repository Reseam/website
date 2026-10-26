<script lang="ts">
	import type { AdminApi } from '#lib/admin.ts';
	import StatusBadge from '#lib/components/requests/StatusBadge.svelte';
	import { plural, recentDate } from '#lib/format.ts';
	import type { PatchRequest } from '#lib/types.ts';
	import CommentsAdmin from './CommentsAdmin.svelte';
	import RequestModeration from './RequestModeration.svelte';

	let {
		request,
		api,
		onchange,
		onremove,
	}: {
		request: PatchRequest;
		api: AdminApi;
		onchange: (request: PatchRequest) => void;
		onremove: (author: boolean) => void;
	} = $props();

	let showComments = $state(false);
</script>

<li class="grid gap-3 px-5 py-4 sm:px-6">
	<div class="flex flex-wrap items-center gap-2.5">
		<span class="text-body-medium text-on-surface-variant tabular-nums">#{request.id}</span>
		<a
			href="/requests/?id={request.id}"
			class="min-w-0 flex-1 text-title-medium transition-colors hover:text-primary"
			>{request.title}</a
		>
		<StatusBadge status={request.status} />
		{#if request.status === 'hidden'}<span class="text-label-medium text-error">Hidden</span>{/if}
	</div>
	{#if request.body}<p class="text-body-medium whitespace-pre-wrap text-on-surface-variant">
			{request.body}
		</p>{/if}
	<p class="flex flex-wrap gap-3 text-body-small text-on-surface-variant">
		<span class="font-mono">{request.app ?? 'no app'}</span>
		<span>{plural(request.votes, 'vote')}</span>
		<button
			type="button"
			aria-expanded={showComments}
			onclick={() => (showComments = !showComments)}
			class="text-primary hover:underline">{plural(request.comments, 'comment')}</button
		>
		<span>{recentDate(request.created_at)}</span>
	</p>
	<RequestModeration {request} {api} {onchange} {onremove} />
	{#if showComments}<CommentsAdmin requestId={request.id} {api} />{/if}
</li>
