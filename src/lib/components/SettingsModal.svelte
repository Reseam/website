<script lang="ts">
	import { Settings } from 'lucide-svelte';
	import Button from '$lib/components/Button.svelte';
	import Dialog from '$lib/components/Dialog.svelte';
	import { DEFAULT_API_URL, settings } from '$lib/settings.svelte';

	let { open, onclose }: { open: boolean; onclose: () => void } = $props();

	let localApiUrl = $state('');
	let error = $state('');

	$effect(() => {
		if (open) {
			localApiUrl = settings.apiUrl;
			error = '';
		}
	});

	function save(event: SubmitEvent) {
		event.preventDefault();
		error = settings.setApiUrl(localApiUrl) ?? '';
		if (!error) onclose();
	}
</script>

<Dialog {open} {onclose} title="Settings" icon={Settings} class="max-w-sm">
	<form onsubmit={save} novalidate>
		<label for="apiUrl" class="block text-sm font-medium text-muted-foreground mb-1.5">
			API Environment URL
		</label>
		<input
			id="apiUrl"
			type="url"
			bind:value={localApiUrl}
			placeholder={DEFAULT_API_URL}
			aria-describedby={error ? 'apiUrl-error' : undefined}
			aria-invalid={error ? true : undefined}
			class="w-full px-4 py-2.5 bg-background border border-border rounded-[0.75rem] transition-colors focus:border-primary aria-invalid:border-destructive"
		/>
		{#if error}
			<p id="apiUrl-error" class="mt-2 text-sm text-destructive">{error}</p>
		{/if}

		<div class="flex justify-end gap-3 pt-8">
			<Button type="button" variant="ghost" onclick={onclose}>Cancel</Button>
			<Button type="submit">Save configuration</Button>
		</div>
	</form>
</Dialog>
