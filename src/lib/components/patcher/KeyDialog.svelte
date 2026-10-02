<script lang="ts">
	import { KeyRound, TriangleAlert } from 'lucide-svelte';
	import Button from '$lib/components/Button.svelte';
	import Dialog from '$lib/components/Dialog.svelte';
	import Callout from './Callout.svelte';
	import { keyBackup, readKey, save } from '$lib/patcher/files';
	import type { Patcher } from '$lib/patcher/patcher.svelte';
	import type { SigningKey } from '$lib/patcher/storage';

	let { patcher, open, onclose }: { patcher: Patcher; open: boolean; onclose: () => void } =
		$props();

	let input: HTMLInputElement;
	let error = $state('');
	// Raw: IndexedDB cannot clone Svelte's state proxies.
	let pending = $state.raw<SigningKey | null>(null);
	let forgetting = $state(false);

	$effect(() => {
		if (open) {
			error = '';
			pending = null;
			forgetting = false;
		}
	});

	async function attempt(action: () => Promise<void>) {
		error = '';
		try {
			await action();
		} catch (cause) {
			error = cause instanceof Error ? cause.message : String(cause);
		}
	}

	function picked() {
		const files = [...(input.files ?? [])];
		input.value = '';
		if (files.length === 0) return;
		void attempt(async () => {
			const key = await readKey(files);
			if (patcher.signingKey) pending = key;
			else await patcher.importKey(key);
		});
	}

	function replace() {
		void attempt(async () => {
			await patcher.importKey(pending!);
			pending = null;
		});
	}

	function backup() {
		void attempt(async () => {
			const key = await patcher.exportKey();
			if (key) save(keyBackup(key), 'reseam-signing-key.zip');
		});
	}

	function forget() {
		void attempt(async () => {
			await patcher.forgetKey();
			forgetting = false;
		});
	}
</script>

<Dialog {open} {onclose} title="Signing key" icon={KeyRound} class="max-w-md">
	<p class="text-sm text-muted-foreground">
		Patched apps are signed with a key kept in this browser. Android installs updates only when they
		are signed with the same key.
	</p>

	{#if pending}
		<Callout icon={TriangleAlert} tone="warning" title="Replace the current key?" class="mt-6">
			<p class="mt-1 text-muted-foreground">
				Apps patched with the current key can then only be updated after uninstalling them, unless
				you keep its backup.
			</p>
			<div class="mt-3 flex gap-2">
				<Button size="sm" onclick={replace}>Replace</Button>
				<Button size="sm" variant="ghost" onclick={() => (pending = null)}>Keep current key</Button>
			</div>
		</Callout>
	{:else if forgetting}
		<Callout icon={TriangleAlert} tone="warning" title="Forget this key?" class="mt-6">
			<p class="mt-1 text-muted-foreground">
				A new key is made on the next patch. Apps signed with this one can then only be updated
				after uninstalling them.
			</p>
			<div class="mt-3 flex gap-2">
				<Button size="sm" onclick={forget}>Forget key</Button>
				<Button size="sm" variant="ghost" onclick={() => (forgetting = false)}>Cancel</Button>
			</div>
		</Callout>
	{:else if patcher.signingKey}
		<p class="mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">
			Certificate SHA-256
		</p>
		<code class="mt-1.5 block break-all font-mono text-xs leading-relaxed"
			>{patcher.signingKey.fingerprint}</code
		>
		<div class="mt-6 flex flex-wrap gap-2">
			<Button size="sm" onclick={backup}>Download backup</Button>
			<Button size="sm" variant="outlined" onclick={() => input.click()}>Import a key</Button>
			<Button size="sm" variant="ghost" onclick={() => (forgetting = true)}>Forget</Button>
		</div>
	{:else}
		<p class="mt-6 text-sm">No key yet. One is made the first time you patch.</p>
		<div class="mt-4">
			<Button size="sm" variant="outlined" onclick={() => input.click()}>Import a key</Button>
		</div>
	{/if}

	{#if error}
		<p class="mt-4 text-sm text-error" role="alert">{error}</p>
	{/if}
	<p class="mt-6 text-xs text-muted-foreground">
		Import the backup .zip, or a .pk8 key with its .der certificate.
	</p>

	<div class="mt-6 flex justify-end">
		<Button variant="ghost" onclick={onclose}>Done</Button>
	</div>

	<input
		bind:this={input}
		type="file"
		multiple
		accept=".zip,.pk8,.der"
		class="sr-only"
		tabindex="-1"
		aria-hidden="true"
		onchange={picked}
	/>
</Dialog>
