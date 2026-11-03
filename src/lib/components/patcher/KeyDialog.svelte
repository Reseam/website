<script lang="ts">
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { Label } from 'bits-ui';
	import Button from '#lib/components/ui/Button.svelte';
	import Callout from '#lib/components/ui/Callout.svelte';
	import Dialog from '#lib/components/ui/Dialog.svelte';
	import { buttonClass } from '#lib/components/ui/button.ts';
	import { save } from '#lib/patcher/files.ts';
	import type { Patcher } from '#lib/patcher/patcher.svelte.ts';
	import { describe } from '#lib/patcher/problems.ts';
	import type { SigningKey } from '#lib/patcher/storage.ts';

	let { patcher, open = $bindable(false) }: { patcher: Patcher; open?: boolean } = $props();

	let error = $state('');
	// Raw: IndexedDB cannot clone Svelte's state proxies.
	let pending = $state.raw<SigningKey | null>(null);
	let forgetting = $state(false);
	/** The backup to import, waiting for its password. */
	let importing = $state.raw<File | null>(null);
	let backingUp = $state(false);
	let password = $state('');

	$effect(() => {
		if (!open) return;
		error = '';
		pending = null;
		forgetting = false;
		importing = null;
		backingUp = false;
		password = '';
	});

	async function attempt(action: () => Promise<void>) {
		error = '';
		try {
			await action();
		} catch (cause) {
			error = describe(cause, patcher.patchName);
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

	const unlock = () =>
		attempt(async () => {
			const key = await patcher.readKey(importing!, password);
			importing = null;
			password = '';
			if (patcher.signingKey) pending = key;
			else await patcher.importKey(key);
		});

	const backup = () =>
		attempt(async () => {
			const file = await patcher.exportKey(password);
			if (file) save(file, 'reseam-signing-key.p12');
			backingUp = false;
			password = '';
		});

	function picked(input: HTMLInputElement) {
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		error = '';
		password = '';
		importing = file;
	}
</script>

{#snippet importButton()}
	<label class={buttonClass('outline', 'sm')}>
		Import a key
		<input
			type="file"
			accept=".p12,.pfx"
			class="sr-only"
			onchange={(event) => picked(event.currentTarget)}
		/>
	</label>
{/snippet}

{#snippet passwordForm(
	label: string,
	action: string,
	submit: () => Promise<void>,
	cancel: () => void
)}
	<form
		class="grid gap-2"
		onsubmit={(event) => {
			event.preventDefault();
			void submit();
		}}
	>
		<Label.Root for="key-password" class="text-label-large">{label}</Label.Root>
		<input
			id="key-password"
			type="password"
			autocomplete="off"
			bind:value={password}
			class="field"
		/>
		<div class="flex gap-2">
			<Button size="sm" type="submit">{action}</Button>
			<Button size="sm" variant="ghost" onclick={cancel}>Cancel</Button>
		</div>
	</form>
{/snippet}

<Dialog
	bind:open
	title="Signing key"
	description="Patched apps are signed with a key kept in this browser. Android installs updates only when they are signed with the same key."
>
	{#if importing}
		{@render passwordForm(
			`Password for ${importing.name}`,
			'Import',
			unlock,
			() => (importing = null)
		)}
	{:else if backingUp}
		{@render passwordForm(
			'Choose a password for the backup',
			'Download backup',
			backup,
			() => (backingUp = false)
		)}
	{:else if pending}
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
			<Button size="sm" onclick={() => (backingUp = true)}>Back up</Button>
			{@render importButton()}
			<Button size="sm" variant="ghost" onclick={() => (forgetting = true)}>Forget</Button>
		</div>
	{:else}
		<p class="text-body-medium">No key yet. One is made the first time you patch.</p>
		<div>{@render importButton()}</div>
	{/if}
	{#if error}<p class="text-body-medium text-error" role="alert">{error}</p>{/if}
	<p class="text-body-small text-on-surface-variant">
		Backups are password-protected .p12 files, which Reseam Manager and the reseam CLI also read.
	</p>
</Dialog>
