<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import Button from '#lib/components/ui/Button.svelte';

	let { name, symbol, address, qr }: { name: string; symbol: string; address: string; qr: string } =
		$props();

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(address);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<li
	class="grid justify-items-center gap-6 rounded-xl border border-outline-variant bg-surface-container-low p-6"
>
	<h3 class="text-title-medium">
		{name} <span class="text-on-surface-variant">({symbol})</span>
	</h3>
	<img
		src={qr}
		alt="QR code for the {name} address"
		width="176"
		height="176"
		class="size-44 rounded-lg bg-white p-3"
	/>
	<div class="grid w-full justify-items-center gap-2">
		<p class="font-mono text-body-medium break-all text-on-surface-variant">{address}</p>
		<Button variant="outline" size="sm" onclick={copy}>
			{#if copied}<Check size={16} /> Copied{:else}<Copy size={16} /> Copy address{/if}
		</Button>
	</div>
</li>
