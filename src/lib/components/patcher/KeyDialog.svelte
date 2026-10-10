<script lang="ts">
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import Button from '#lib/components/ui/Button.svelte';
	import Callout from '#lib/components/ui/Callout.svelte';
	import Dialog from '#lib/components/ui/Dialog.svelte';
	import { buttonClass } from '#lib/components/ui/button.ts';
	import { keyBackup, readKey, save } from '#lib/patcher/files.ts';
	import type { Patcher } from '#lib/patcher/patcher.svelte.ts';
	import type { SigningKey } from '#lib/patcher/storage.ts';

	let { patcher, open = $bindable(false) }: { patcher: Patcher; open?: boolean } = $props();

	let error = $state('');
	// Raw: IndexedDB cannot clone Svelte's state proxies.
	let pending = $state.raw<SigningKey | null>(null);
	let forgetting = $state(false);

	$effect(() => {
		if (!open) return;
		error = '';
		pending = null;
		forgetting = false;
	});

	async function attempt(action: () => Promise<void>) {
		error = '';
		try {
			await action();
		} catch (cause) {
			error = cause instanceof Error ? cause.message : String(cause);
		}
	}

	const replace = () =>
		attempt(async () => {
			await patcher.importKey(pending!);
			pending = null;
		});

	const forget = () =>
		attempt(async () => {
			await patcher.forgetKey();
			forgetting = false;
		});

	const backup = () =>
		attempt(async () => {
			const key = await patcher.exportKey();
			if (key) save(keyBackup(key), 'reseam-signing-key.zip');
		});

	function picked(input: HTMLInputElement) {
		const files = [...(input.files ?? [])];
		input.value = '';
		if (files.length === 0) return;
		void attempt(async () => {
			const key = await readKey(files);
			if (patcher.signingKey) pending = key;
			else await patcher.importKey(key);
		});
	}
</script>

{#snippet importButton()}
	<label class={buttonClass('outline', 'sm')}>
		Import a key
		<input
			type="file"
			multiple
			accept=".zip,.pk8,.der"
			class="sr-only"
			onchange={(event) => picked(event.currentTarget)}
		/>
	</label>
{/snippet}

<Dialog
	bind:open
	title="Signing key"
	description="Patched apps are signed with a key kept in this browser. Android installs updates only when they are signed with the same key."
>
	{#if pending}
		<Callout icon={TriangleAlert} tone="warning" title="Replace the current key?">
			<p class="mt-1 text-on-surface-variant">
				Apps patched with the current key can then only be updated after uninstalling them, unless
				you keep its backup.
			</p>
			<div class="mt-3 flex gap-2">
				<Button size="sm" onclick={replace}>Replace</Button>
				<Button size="sm" variant="ghost" onclick={() => (pending = null)}>Keep current key</Button>
			</div>
		</Callout>
	{:else if forgetting}
		<Callout icon={TriangleAlert} tone="warning" title="Forget this key?">
			<p class="mt-1 text-on-surface-variant">
				A new key is made on the next patch. Apps signed with this one can then only be updated
				after uninstalling them.
			</p>
			<div class="mt-3 flex gap-2">
				<Button size="sm" onclick={forget}>Forget key</Button>
				<Button size="sm" variant="ghost" onclick={() => (forgetting = false)}>Cancel</Button>
			</div>
		</Callout>
	{:else if patcher.signingKey}
		<div class="grid gap-1.5">
			<p class="text-label-medium text-on-surface-variant">Certificate SHA-256</p>
			<code class="font-mono text-mono-xs break-all">{patcher.signingKey.fingerprint}</code>
		</div>
		<div class="flex flex-wrap gap-2">
			<Button size="sm" onclick={backup}>Download backup</Button>
			{@render importButton()}
			<Button size="sm" variant="ghost" onclick={() => (forgetting = true)}>Forget</Button>
		</div>
	{:else}
		<p class="text-body-medium">No key yet. One is made the first time you patch.</p>
		<div>{@render importButton()}</div>
	{/if}
	{#if error}<p class="text-body-medium text-error" role="alert">{error}</p>{/if}
	<p class="text-body-small text-on-surface-variant">
		Import the backup .zip, or a .pk8 key with its .der certificate.
	</p>
</Dialog>
