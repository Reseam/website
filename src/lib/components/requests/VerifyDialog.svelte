<script lang="ts">
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

<Dialog
	bind:open
	title="One quick check"
	description="Voting needs no account. This check keeps bots out, and this browser remembers it."
>
	{#if open}<Turnstile
			onverified={verified}
			onfailed={() => (error = 'The check did not load. Try again.')}
		/>{/if}
	{#if error}<p class="text-body-medium text-error" role="alert">{error}</p>{/if}
</Dialog>
