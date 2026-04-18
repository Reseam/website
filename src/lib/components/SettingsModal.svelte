<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { Settings } from 'lucide-svelte';
	import Button from '$lib/components/Button.svelte';
	import { settings } from '$lib/stores/settings.svelte';
	import { api } from '$lib/stores/api.svelte';

	let { open, onclose }: { open: boolean; onclose: () => void } = $props();

	let localApiUrl = $state('');

	$effect(() => {
		if (open) localApiUrl = settings.apiUrl;
	});

	function save() {
		settings.setApiUrl(localApiUrl);
		api.reload();
		onclose();
	}
</script>

{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<button
			transition:fade={{ duration: 200 }}
			class="absolute inset-0 bg-background/80 backdrop-blur-sm cursor-default"
			onclick={onclose}
			aria-label="Close settings"
		></button>
		<div
			in:scale={{ duration: 250, start: 0.95, easing: cubicOut }}
			out:scale={{ duration: 200, start: 0.95 }}
			class="relative bg-card border border-border p-6 sm:p-8 rounded-[1.5rem] shadow-lg w-full max-w-sm"
		>
			<div class="flex items-center gap-3 mb-6">
				<div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
					<Settings size={20} class="text-foreground" />
				</div>
				<h2 class="text-xl font-semibold">Settings</h2>
			</div>

			<div class="space-y-4">
				<div>
					<label for="apiUrl" class="block text-sm font-medium text-muted-foreground mb-1.5">
						API Environment URL
					</label>
					<input
						id="apiUrl"
						type="text"
						bind:value={localApiUrl}
						placeholder={settings.defaultApiUrl}
						class="w-full px-4 py-2.5 bg-background border border-border rounded-[0.75rem] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
					/>
				</div>

				<div class="flex justify-end gap-3 pt-4">
					<Button variant="ghost" onclick={onclose}>Cancel</Button>
					<Button onclick={save}>Save configuration</Button>
				</div>
			</div>
		</div>
	</div>
{/if}
