<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Inbox from '@lucide/svelte/icons/inbox';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import Callout from '#lib/components/ui/Callout.svelte';
	import {
		shippedEntry,
		STATUS_NOTICES,
		unseenChanges,
		unseenComments,
	} from '#lib/requests.svelte.ts';
	import type { PatchRequest } from '#lib/types.ts';

	let { mine, held }: { mine: PatchRequest[]; held: boolean } = $props();

	let notices = $state.raw<PatchRequest[]>([]);
	let commented = $state.raw<PatchRequest[]>([]);
	$effect(() => {
		if (mine.length === 0) return;
		const changes = unseenChanges(mine);
		const comments = unseenComments(mine);
		notices = changes.changed;
		commented = comments.commented;
		changes.markSeen();
		comments.markSeen();
	});
</script>

{#each notices as notice (notice.id)}
	{@const shipped = notice.shipped_in ? shippedEntry(notice.shipped_in) : undefined}
	<Callout
		icon={CircleCheck}
		title={STATUS_NOTICES[notice.status as keyof typeof STATUS_NOTICES]({ title: notice.title })}
	>
		{#if shipped}<p class="mt-1">
				{m.notice_shipped_in({ release: shipped.label })}
				<a href={shipped.href} class="text-primary hover:underline">{m.action_read()}</a>
			</p>{/if}
	</Callout>
{/each}
{#each commented as request (request.id)}
	<Callout icon={MessageSquare} title={m.notice_comments({ title: request.title })}>
		<p class="mt-1">
			<a href="?id={request.id}" class="text-primary hover:underline">{m.notice_read()}</a>
		</p>
	</Callout>
{/each}
{#if held}
	<Callout icon={Inbox} tone="warning" title={m.notice_held_title()}>
		<p class="mt-1">{m.notice_held_text()}</p>
	</Callout>
{/if}
