<script lang="ts">
	import Badge, { type BadgeTone } from '#lib/components/ui/Badge.svelte';
	import { PRIORITIES, STATUSES } from '#lib/requests.svelte.ts';
	import type { PatchRequest, RequestPriority } from '#lib/types.ts';

	let { request }: { request: PatchRequest } = $props();

	const PRIORITY_TONES: Record<RequestPriority, BadgeTone> = {
		high: 'warning',
		medium: 'info',
		low: 'outline',
	};
</script>

{#if request.status === 'open'}
	{#if request.priority}
		<Badge tone={PRIORITY_TONES[request.priority]}>{PRIORITIES[request.priority]()}</Badge>
	{/if}
{:else if request.status !== 'hidden'}
	<Badge tone={request.status === 'shipped' ? 'primary' : 'outline'}
		>{STATUSES[request.status]()}</Badge
	>
{/if}
