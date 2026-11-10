<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import Dialog from '#lib/components/ui/Dialog.svelte';
	import Turnstile from './Turnstile.svelte';

	let {
		open = $bindable(false),
		onverified,
	}: { open?: boolean; onverified: (turnstile: string) => Promise<void> } = $props();

	let error = $state('');

	$effect(() => {
		if (open) error = '';
	});

	async function verified(turnstile: string) {
		try {
			await onverified(turnstile);
			open = false;
		} catch (failure) {
			error = failure instanceof Error ? failure.message : String(failure);
		}
	}
</script>

<Dialog bind:open title={m.verify_title()} description={m.verify_description()}>
	{#if open}<Turnstile onverified={verified} onfailed={() => (error = m.verify_failed())} />{/if}
	{#if error}<p class="text-body-medium text-error" role="alert">{error}</p>{/if}
</Dialog>
