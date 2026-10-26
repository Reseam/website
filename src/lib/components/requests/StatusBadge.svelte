<script lang="ts">
	import Badge, { type BadgeTone } from '#lib/components/ui/Badge.svelte';
	import { STATUSES } from '#lib/requests.svelte.ts';
	import type { RequestStatus } from '#lib/types.ts';

	let { status }: { status: RequestStatus } = $props();

	const TONES: Partial<Record<RequestStatus, BadgeTone>> = { planned: 'info', shipped: 'primary' };
</script>

{#if status !== 'open' && status !== 'hidden'}
	<Badge tone={TONES[status] ?? 'outline'}>{STATUSES[status]}</Badge>
{/if}
