<script lang="ts">
	import User from '@lucide/svelte/icons/user';
	import Logo from '#lib/components/layout/Logo.svelte';
	import Markdown from '#lib/components/ui/Markdown.svelte';
	import { recentDate } from '#lib/format.ts';
	import type { RequestComment } from '#lib/types.ts';

	let {
		comment,
		moderating,
		mine,
		reported,
		canReport,
		ontoggle,
		onremove,
		onreport,
	}: {
		comment: RequestComment;
		moderating: boolean;
		mine: boolean;
		reported: boolean;
		canReport: boolean;
		ontoggle: () => void;
		onremove: () => void;
		onreport: () => void;
	} = $props();

	const action = 'transition-colors hover:text-on-surface';
	const danger = 'text-error transition-colors hover:text-on-error-container';
</script>

<li class="flex gap-3">
	<span
		class={[
			'grid size-9 shrink-0 place-items-center rounded-full',
			comment.team ? 'bg-secondary-container' : 'bg-surface-container-high text-on-surface-variant',
		]}
		aria-hidden="true"
	>
		{#if comment.team}<Logo class="size-5" />{:else}<User size={18} />{/if}
	</span>
	<div class="grid min-w-0 flex-1 gap-2">
		<div class="flex flex-wrap items-baseline gap-x-2 text-body-small text-on-surface-variant">
			{#if comment.team}
				<span class="text-label-large text-primary">Reseam team</span>
			{:else if comment.requester}
				<span class="text-label-large text-on-surface">Requester</span>
			{:else}
				<span class="text-label-large">Anonymous</span>
			{/if}
			<time datetime={comment.created_at}>{recentDate(comment.created_at)}</time>
			{#if comment.hidden}<span class="text-warning">Hidden</span>{/if}
			<span class="flex gap-3">
				{#if moderating}
					<button type="button" class={comment.hidden ? action : danger} onclick={ontoggle}
						>{comment.hidden ? 'Show' : 'Hide'}</button
					>
					<button type="button" class={danger} onclick={onremove}>Delete</button>
				{:else if mine}
					<button type="button" class={danger} onclick={onremove}>Delete</button>
				{:else if reported}
					<span>Reported</span>
				{:else if canReport && !comment.team}
					<button type="button" class={danger} onclick={onreport}>Report</button>
				{/if}
			</span>
		</div>
		<Markdown
			text={comment.body}
			class={[
				'text-body-large',
				comment.hidden && moderating && 'text-on-surface-variant line-through decoration-outline',
			]}
		/>
		{#if comment.hidden && !moderating}
			<p class="text-body-small text-on-surface-variant">
				Held as possible spam. Only you can see it.
			</p>
		{/if}
	</div>
</li>
