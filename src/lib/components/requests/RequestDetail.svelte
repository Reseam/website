<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import type { AdminApi } from '#lib/admin.ts';
	import RequestModeration from '#lib/components/admin/RequestModeration.svelte';
	import AppIcon from '#lib/components/patches/AppIcon.svelte';
	import Markdown from '#lib/components/ui/Markdown.svelte';
	import { longDate } from '#lib/format.ts';
	import { shippedEntry } from '#lib/requests.svelte.ts';
	import type { AppInfo, PatchRequest } from '#lib/types.ts';
	import StatusBadge from './StatusBadge.svelte';
	import VoteButton from './VoteButton.svelte';

	let {
		request,
		app,
		duplicateOf,
		voted,
		canVote,
		reported,
		onvote,
		onreport,
		admin,
		onchange,
		onremove,
	}: {
		request: PatchRequest;
		app: AppInfo | undefined;
		duplicateOf: PatchRequest | undefined;
		voted: boolean;
		canVote: boolean;
		reported: boolean;
		onvote: () => void;
		onreport: () => void;
		admin: AdminApi | undefined;
		onchange: (request: PatchRequest) => void;
		onremove: () => void;
	} = $props();

	const shipped = $derived(request.shipped_in ? shippedEntry(request.shipped_in) : undefined);
</script>

<article class="grid gap-6">
	<a
		href="?"
		class="inline-flex items-center gap-1 justify-self-start text-body-medium text-on-surface-variant transition-colors hover:text-on-surface"
	>
		<ChevronLeft size={16} /> All requests
	</a>
	<div class="flex items-start gap-6">
		<div class="grid min-w-0 flex-1 gap-2">
			{#if request.status !== 'open'}<div><StatusBadge status={request.status} /></div>{/if}
			<h1 class="text-headline-large">{request.title}</h1>
			<p
				class="flex flex-wrap items-center gap-x-3 gap-y-1 text-body-medium text-on-surface-variant"
			>
				{#if request.app}
					<span class="flex items-center gap-1.5">
						<AppIcon icon={app?.icon} size={18} />
						{app?.name ?? request.app}
					</span>
				{:else}
					<span>Any app</span>
				{/if}
				<time datetime={request.created_at}>{longDate(request.created_at)}</time>
				{#if reported}
					<span>Reported, thanks</span>
				{:else if canVote && !admin}
					<button
						type="button"
						onclick={onreport}
						class="text-error transition-colors hover:text-on-error-container">Report</button
					>
				{/if}
			</p>
			<div class="mt-4 grid gap-6">
				{#if request.body}
					<Markdown text={request.body} class="text-article" />
				{/if}
				{#if shipped}
					<p class="text-body-large">
						Shipped in <a href={shipped.href} class="text-primary hover:underline"
							>{shipped.label}</a
						>.
					</p>
				{:else if duplicateOf}
					<p class="text-body-large">
						Same as <a href="?id={duplicateOf.id}" class="text-primary hover:underline"
							>{duplicateOf.title}</a
						>.
					</p>
				{/if}
				{#if admin}
					<RequestModeration {request} api={admin} {onchange} onremove={() => onremove()} />
				{/if}
			</div>
		</div>
		<VoteButton votes={request.votes} {voted} disabled={!canVote} onclick={onvote} />
	</div>
</article>
