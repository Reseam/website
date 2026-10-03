<script lang="ts">
	import { LoaderCircle, Plus, RotateCcw, ShieldAlert, ShieldCheck, X } from 'lucide-svelte';
	import type { BundleMetadata } from '@reseam/browser';
	import { OFFICIAL_SIGNER } from '$lib/patcher/official';
	import { explain } from '$lib/patcher/problems';
	import type { Patcher } from '$lib/patcher/patcher.svelte';

	let { patcher }: { patcher: Patcher } = $props();

	let input: HTMLInputElement;

	// Inspection lists bundles in mount order: the official bundle first, when it loaded.
	const offset = $derived(patcher.official.status === 'ready' ? 1 : 0);
	const metadata = (index: number): BundleMetadata | undefined =>
		patcher.inspection?.bundles[index + offset];

	// A hand-added copy of the official bundle stands in for a failed download.
	const officialAdded = $derived(
		patcher.bundles.some((_, index) => metadata(index)?.public_key === OFFICIAL_SIGNER)
	);

	function picked() {
		const files = [...(input.files ?? [])];
		input.value = '';
		if (files.length > 0) void patcher.choose(files);
	}
</script>

<h3 class="px-5 pt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-6">
	Patches from
</h3>
<ul class="divide-y divide-border">
	{#if patcher.official.status !== 'failed' || !officialAdded}
		<li class="flex items-center gap-3 px-5 py-3 text-sm sm:px-6">
			{#if patcher.official.status === 'ready'}
				<ShieldCheck size={18} class="shrink-0 text-primary" />
				<span class="min-w-0 flex-1 break-words">
					<span class="font-medium">Reseam patches</span>
					<span class="text-muted-foreground">· v{patcher.official.bundle.version} · Official</span>
				</span>
			{:else if patcher.official.status === 'loading'}
				<LoaderCircle size={18} class="shrink-0 animate-spin text-muted-foreground" />
				<span class="flex-1 text-muted-foreground" role="status">Downloading Reseam patches…</span>
			{:else}
				<ShieldAlert size={18} class="shrink-0 text-amber-500" />
				<span class="min-w-0 flex-1 text-muted-foreground">
					Reseam patches could not be downloaded.
				</span>
				<button
					type="button"
					onclick={() => patcher.loadOfficial()}
					class="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-medium hover:bg-muted"
				>
					<RotateCcw size={14} /> Retry
				</button>
			{/if}
		</li>
	{/if}

	{#each patcher.bundles as file, index (file)}
		{@const bundle = metadata(index)}
		{@const official = bundle?.public_key === OFFICIAL_SIGNER}
		<li class="px-5 py-3 text-sm sm:px-6">
			<div class="flex items-center gap-3">
				{#if bundle && !bundle.problem && patcher.trusted.has(bundle.public_key)}
					<ShieldCheck size={18} class="shrink-0 text-primary" />
				{:else}
					<ShieldAlert size={18} class="shrink-0 text-amber-500" />
				{/if}
				<span class="min-w-0 flex-1 break-words">
					<span class="font-medium">{bundle?.name ?? file.name}</span>
					<span class="text-muted-foreground"
						>{[bundle?.author, official && 'Official']
							.filter(Boolean)
							.map((part) => ` · ${part}`)
							.join('')}</span
					>
				</span>
				<button
					type="button"
					onclick={() => patcher.removeBundle(file)}
					aria-label="Remove {bundle?.name ?? file.name}"
					class="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
				>
					<X size={16} />
				</button>
			</div>
			{#if bundle?.problem}
				<p class="mt-1.5 pl-7.5 text-muted-foreground">
					{explain(bundle.problem, patcher.patchName) ?? 'This bundle could not be read.'}
				</p>
			{:else if bundle && !official}
				<label class="mt-2 flex cursor-pointer items-start gap-2.5 pl-7.5">
					<input
						type="checkbox"
						checked={patcher.trusted.has(bundle.public_key)}
						onchange={(event) => patcher.trust(bundle.public_key, event.currentTarget.checked)}
						class="mt-0.5 size-4 shrink-0 accent-primary"
					/>
					<span class="min-w-0 text-muted-foreground">
						I trust this signer. Its patches run code while patching.
						<code class="mt-0.5 block break-all font-mono text-xs opacity-70"
							>{bundle.public_key}</code
						>
					</span>
				</label>
			{/if}
		</li>
	{/each}

	<li>
		<button
			type="button"
			onclick={() => input.click()}
			class="flex w-full items-center gap-3 px-5 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground sm:px-6"
		>
			<Plus size={18} class="shrink-0" /> Add a patch bundle
		</button>
	</li>
</ul>
<input
	bind:this={input}
	type="file"
	multiple
	accept=".reseam"
	class="sr-only"
	tabindex="-1"
	aria-hidden="true"
	onchange={picked}
/>
