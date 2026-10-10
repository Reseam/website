<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Plus from '@lucide/svelte/icons/plus';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import X from '@lucide/svelte/icons/x';
	import type { BundleMetadata } from '@reseam/browser';
	import { Label } from 'bits-ui';
	import Checkbox from '#lib/components/ui/Checkbox.svelte';
	import { buttonClass } from '#lib/components/ui/button.ts';
	import { OFFICIAL_SIGNER } from '#lib/patcher/official.ts';
	import type { Patcher } from '#lib/patcher/patcher.svelte.ts';
	import { explain } from '#lib/patcher/problems.ts';

	let { patcher }: { patcher: Patcher } = $props();

	// Inspection lists bundles in mount order: the official bundle first, when it loaded.
	const offset = $derived(patcher.official.status === 'ready' ? 1 : 0);
	const metadata = (index: number): BundleMetadata | undefined =>
		patcher.inspection?.bundles[index + offset];
	// A hand-added copy of the official bundle stands in for a failed download.
	const officialAdded = $derived(
		patcher.bundles.some((_, index) => metadata(index)?.public_key === OFFICIAL_SIGNER)
	);
</script>

<p class="px-1 pb-2.5 text-label-medium text-on-surface-variant">Patches from</p>
<ul
	class="divide-y divide-outline-variant overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low"
>
	{#if patcher.official.status !== 'failed' || !officialAdded}
		<li class="flex items-center gap-3 px-4 py-3.5 sm:px-5">
			<div class="min-w-0 flex-1">
				<p class="text-title-medium">Official patches</p>
				<p class="text-body-medium text-on-surface-variant" role="status">
					{#if patcher.official.status === 'ready'}Reseam · {patcher.official.bundle.version}
					{:else if patcher.official.status === 'loading'}Downloading…
					{:else}Could not be downloaded.{/if}
				</p>
			</div>
			{#if patcher.official.status === 'ready'}
				<span class="inline-flex items-center gap-1.5 text-label-large text-primary"
					><Check size={15} strokeWidth={3} /> Ready</span
				>
			{:else if patcher.official.status === 'loading'}
				<LoaderCircle size={18} class="animate-spin text-on-surface-variant" />
			{:else}
				<button
					type="button"
					onclick={() => patcher.loadOfficial()}
					class={buttonClass('ghost', 'sm')}><RotateCcw size={14} /> Retry</button
				>
			{/if}
		</li>
	{/if}
	{#each patcher.bundles as file, index (file)}
		{@const bundle = metadata(index)}
		{@const official = bundle?.public_key === OFFICIAL_SIGNER}
		<li class="flex items-start gap-3 px-4 py-3.5 sm:px-5">
			<div class="min-w-0 flex-1">
				<p class="text-title-medium break-words">{bundle?.name ?? file.name}</p>
				<p class="text-body-medium text-on-surface-variant">
					{[bundle?.author && `by ${bundle.author}`, official && 'Official']
						.filter(Boolean)
						.join(' · ') || 'Checking bundle…'}
				</p>
				{#if bundle?.problem}
					<p class="mt-1.5 text-body-medium text-error">
						{explain(bundle.problem, patcher.patchName) ?? 'This bundle could not be read.'}
					</p>
				{:else if bundle && !official}
					<div class="mt-2.5 flex items-start gap-2.5">
						<Checkbox
							id="trust-{index}"
							checked={patcher.trusted.has(bundle.public_key)}
							onCheckedChange={(value) => patcher.trust(bundle.public_key, value)}
						/>
						<Label.Root
							for="trust-{index}"
							class="min-w-0 text-body-medium text-on-surface-variant"
						>
							I trust this signer. Its patches run code while patching.
							<code class="mt-1 block font-mono text-mono-xs break-all opacity-70"
								>{bundle.public_key}</code
							>
						</Label.Root>
					</div>
				{/if}
			</div>
			<button
				type="button"
				onclick={() => patcher.removeBundle(file)}
				aria-label="Remove {bundle?.name ?? file.name}"
				class="-mt-1 -mr-2 {buttonClass('ghost', 'icon')}"
			>
				<X size={16} />
			</button>
		</li>
	{/each}
	<li>
		<label
			class="flex cursor-pointer items-center gap-3 px-4 py-3.5 text-label-large transition-colors hover:bg-surface-container has-focus-visible:bg-surface-container sm:px-5"
		>
			<Plus size={16} class="text-on-surface-variant" /> Add a patch bundle
			<input
				type="file"
				multiple
				accept=".reseam"
				class="sr-only"
				onchange={(event) => {
					const files = [...(event.currentTarget.files ?? [])];
					event.currentTarget.value = '';
					if (files.length > 0) void patcher.choose(files);
				}}
			/>
		</label>
	</li>
</ul>
