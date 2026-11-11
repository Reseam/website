<script lang="ts">
	import { Label } from 'bits-ui';
	import Button from '#lib/components/ui/Button.svelte';
	import Dialog from '#lib/components/ui/Dialog.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { DEFAULT_API_URL, settings } from '#lib/settings.svelte.ts';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let value = $state('');
	let error = $state('');

	$effect(() => {
		if (!open) return;
		value = settings.apiUrl;
		error = '';
	});

	function save(event: SubmitEvent) {
		event.preventDefault();
		error = settings.setApiUrl(value) ?? '';
		if (!error) open = false;
	}
</script>

<Dialog bind:open title={m.settings_title()}>
	<form id="settings-form" onsubmit={save} novalidate class="grid gap-2">
		<Label.Root for="api-url" class="text-label-large">{m.settings_api_server()}</Label.Root>
		<input
			id="api-url"
			type="url"
			bind:value
			placeholder={DEFAULT_API_URL}
			aria-invalid={error ? true : undefined}
			aria-describedby="api-url-help"
			class="field"
		/>
		<p id="api-url-help" class="text-body-medium text-on-surface-variant">
			{m.settings_api_server_help()}
		</p>
		{#if error}<p class="text-body-medium text-error" role="alert">{error}</p>{/if}
	</form>
	{#snippet footer()}
		<Button variant="ghost" class="mr-auto" onclick={() => (value = DEFAULT_API_URL)}
			>{m.action_reset()}</Button
		>
		<Button variant="outline" onclick={() => (open = false)}>{m.action_cancel()}</Button>
		<Button type="submit" form="settings-form">{m.action_save()}</Button>
	{/snippet}
</Dialog>
