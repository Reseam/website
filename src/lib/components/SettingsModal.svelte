<script lang="ts">
	import { Settings } from 'lucide-svelte';
	import Button from '$lib/components/Button.svelte';
	import { DEFAULT_API_URL, settings } from '$lib/settings.svelte';

	let { open, onclose }: { open: boolean; onclose: () => void } = $props();

	let dialog: HTMLDialogElement;
	let localApiUrl = $state('');
	let error = $state('');

	$effect(() => {
		if (open) {
			localApiUrl = settings.apiUrl;
			error = '';
			dialog.showModal();
		} else {
			dialog.close();
		}
	});

	function save(event: SubmitEvent) {
		event.preventDefault();
		error = settings.setApiUrl(localApiUrl) ?? '';
		if (!error) onclose();
	}

	function onclick(event: MouseEvent) {
		if (event.target === dialog) onclose();
	}
</script>

<dialog
	bind:this={dialog}
	{onclick}
	{onclose}
	aria-labelledby="settings-title"
	class="m-auto w-[calc(100%-2rem)] max-w-sm rounded-[1.5rem] border border-border bg-card p-6 text-card-foreground shadow-lg backdrop:bg-background/80 backdrop:backdrop-blur-sm sm:p-8"
>
	<form onsubmit={save} novalidate>
		<div class="flex items-center gap-3 mb-6">
			<div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
				<Settings size={20} class="text-foreground" />
			</div>
			<h2 id="settings-title" class="text-xl font-semibold">Settings</h2>
		</div>

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
</dialog>

<style>
	dialog {
		opacity: 0;
		transform: scale(0.95);
		transition:
			opacity 200ms ease-out,
			transform 200ms ease-out,
			overlay 200ms ease-out allow-discrete,
			display 200ms ease-out allow-discrete;
	}
	dialog[open] {
		opacity: 1;
		transform: none;
	}
	@starting-style {
		dialog[open] {
			opacity: 0;
			transform: scale(0.95);
		}
	}
</style>
