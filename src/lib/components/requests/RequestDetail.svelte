<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import AppIcon from '#lib/components/patches/AppIcon.svelte';
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
	}: {
		request: PatchRequest;
		app: AppInfo | undefined;
		duplicateOf: PatchRequest | undefined;
		voted: boolean;
		canVote: boolean;
		reported: boolean;
		onvote: () => void;
		onreport: () => void;
	} = $props();

	const shipped = $derived(request.shipped_in ? shippedEntry(request.shipped_in) : undefined);
</script>

<article class="grid gap-4">
	<a
		href="?"
		class="inline-flex items-center gap-1 justify-self-start text-body-medium text-on-surface-variant transition-colors hover:text-on-surface"
	>
		<ChevronLeft size={16} /> All requests
	</a>
	<div class="flex gap-5">
		<VoteButton votes={request.votes} {voted} disabled={!canVote} onclick={onvote} />
		<div class="grid min-w-0 flex-1 gap-3">
			<div><StatusBadge status={request.status} /></div>
			<h1 class="text-headline-large">{request.title}</h1>
			<p class="flex flex-wrap items-center gap-3 text-body-medium text-on-surface-variant">
				{#if request.app}
					<span class="flex items-center gap-1.5">
						<AppIcon icon={app?.icon} size={18} />
						{app?.name ?? request.app}
					</span>
				{/if}
				<time datetime={request.created_at}>{longDate(request.created_at)}</time>
			</p>
			{#if request.body}
				<p
					class="max-w-[72ch] border-t border-outline-variant pt-4 text-article whitespace-pre-wrap"
				>
					{request.body}
				</p>
			{/if}
			{#if shipped}
				<p class="text-body-large">
					Shipped in <a href={shipped.href} class="text-primary hover:underline">{shipped.label}</a
					>.
				</p>
			{:else if duplicateOf}
				<p class="text-body-large">
					Same as <a href="?id={duplicateOf.id}" class="text-primary hover:underline"
						>{duplicateOf.title}</a
					>.
				</p>
			{/if}
			<div class="pt-2">
				{#if reported}
					<p class="text-body-medium text-on-surface-variant">Thanks, it's reported.</p>
				{:else}
					<button
						type="button"
						onclick={onreport}
						disabled={!canVote}
						class="text-label-large text-on-surface-variant transition-colors hover:text-error disabled:opacity-50"
						>Report as spam or abuse</button
					>
				{/if}
			</div>
		</div>
	</div>
</article>
