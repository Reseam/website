<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Inbox from '@lucide/svelte/icons/inbox';
	import Callout from '#lib/components/ui/Callout.svelte';
	import { shippedEntry, STATUSES, unseenChanges } from '#lib/requests.svelte.ts';
	import type { PatchRequest } from '#lib/types.ts';

	let { mine, held }: { mine: PatchRequest[]; held: boolean } = $props();

	let notices = $state.raw<PatchRequest[]>([]);
	$effect(() => {
		if (mine.length === 0) return;
		const changes = unseenChanges(mine);
		notices = changes.changed;
		changes.markSeen();
	});
</script>

{#each notices as notice (notice.id)}
	{@const shipped = notice.shipped_in ? shippedEntry(notice.shipped_in) : undefined}
	<Callout
		icon={CircleCheck}
		title="Your request “{notice.title}” is {STATUSES[
			notice.status as keyof typeof STATUSES
		]?.toLowerCase()}"
	>
		{#if shipped}<p class="mt-1">
				It shipped in <a href={shipped.href} class="text-primary hover:underline">{shipped.label}</a
				>.
			</p>{/if}
	</Callout>
{/each}
{#if held}
	<Callout icon={Inbox} tone="warning" title="Your request is waiting for a look">
		<p class="mt-1">It was held as possible spam. A moderator will check it.</p>
	</Callout>
{/if}
