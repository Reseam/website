<script lang="ts">
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import AppIcon from '#lib/components/patches/AppIcon.svelte';
	import { plural, recentDate } from '#lib/format.ts';
	import type { AppInfo, PatchRequest } from '#lib/types.ts';
	import StatusBadge from './StatusBadge.svelte';
	import VoteButton from './VoteButton.svelte';

	let {
		request,
		app,
		voted,
		canVote,
		onvote,
	}: {
		request: PatchRequest;
		app: AppInfo | undefined;
		voted: boolean;
		canVote: boolean;
		onvote: () => void;
	} = $props();
</script>

<li class="flex gap-4 px-5 py-4 sm:px-6">
	<VoteButton votes={request.votes} {voted} disabled={!canVote} onclick={onvote} />
	<a href="?id={request.id}" class="group grid min-w-0 flex-1 content-start gap-1.5">
		<span class="flex flex-wrap items-center gap-2.5">
			<span class="min-w-0 text-title-medium transition-colors group-hover:text-primary"
				>{request.title}</span
			>
			<StatusBadge status={request.status} />
		</span>
		{#if request.body}<span class="line-clamp-2 text-body-medium text-on-surface-variant"
				>{request.body}</span
			>{/if}
		<span
			class="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-small text-on-surface-variant"
		>
			{#if request.app}
				<span class="flex items-center gap-1.5">
					<AppIcon icon={app?.icon} size={16} />
					{app?.name ?? request.app}
				</span>
			{/if}
			<time datetime={request.created_at}>{recentDate(request.created_at)}</time>
			{#if request.comments > 0}
				<span class="flex items-center gap-1.5">
					<MessageSquare size={14} aria-hidden="true" />
					{plural(request.comments, 'comment')}
				</span>
			{/if}
		</span>
	</a>
</li>
