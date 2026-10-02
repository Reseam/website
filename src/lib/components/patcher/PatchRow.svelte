<script lang="ts">
	import { ChevronDown, Settings2 } from 'lucide-svelte';
	import type { PatchMetadata } from '@reseam/browser';
	import { cn } from '$lib/cn';
	import type { Patcher } from '$lib/patcher/patcher.svelte';
	import { reference, runnable } from '$lib/patcher/selection';
	import OptionField from './OptionField.svelte';

	let { patcher, patch }: { patcher: Patcher; patch: PatchMetadata } = $props();

	const key = $derived(reference(patch));
	const chosen = $derived(patcher.chosen.has(key));
	const requiredBy = $derived(patcher.running.get(key) ?? []);
	const included = $derived(!chosen && requiredBy.length > 0);
	const available = $derived(runnable(patch, patcher.ignoreVersions));
	const errors = $derived(
		patch.options.filter((option) => patcher.optionError(patch, option.key)).length
	);
	const running = $derived(chosen || included);

	let expanded = $state(false);
	const open = $derived(running && (expanded || errors > 0));
</script>

<li class={cn('transition-colors', !available && 'opacity-60')}>
	<div class="flex items-start gap-3 px-5 py-4 sm:px-6">
		<input
			id="patch-{key}"
			type="checkbox"
			checked={running}
			disabled={included || !available}
			aria-describedby="patch-{key}-description"
			onchange={() => patcher.toggle(patch)}
			class="mt-1 size-4 shrink-0 cursor-pointer accent-primary disabled:cursor-default"
		/>
		<div class="min-w-0 flex-1">
			<label for="patch-{key}" class="cursor-pointer font-medium">{patch.name}</label>
			<div id="patch-{key}-description">
				{#if patch.description}
					<p class="mt-0.5 text-sm leading-relaxed text-muted-foreground">{patch.description}</p>
				{/if}
				{#if included}
					<p class="mt-1.5 text-xs text-muted-foreground">
						Included for {requiredBy.map(patcher.patchName).join(', ')}
					</p>
				{:else if !available}
					<p class="mt-1.5 text-xs text-muted-foreground">Not made for this app version</p>
				{/if}
			</div>
			{#if running && patch.options.length > 0}
				<button
					type="button"
					aria-expanded={open}
					aria-controls="patch-{key}-options"
					onclick={() => (expanded = !open)}
					class={cn(
						'mt-2 inline-flex items-center gap-1.5 text-xs transition-colors hover:text-foreground',
						errors > 0 ? 'text-error' : 'text-muted-foreground'
					)}
				>
					<Settings2 size={13} />
					{errors > 0
						? `${errors} ${errors === 1 ? 'option needs' : 'options need'} a value`
						: `${patch.options.length} ${patch.options.length === 1 ? 'option' : 'options'}`}
					<ChevronDown size={13} class={cn('transition-transform', open && 'rotate-180')} />
				</button>
			{/if}
		</div>
	</div>
	{#if open}
		<div
			id="patch-{key}-options"
			class="mx-5 mb-4 space-y-4 rounded-[1rem] border border-border bg-background/60 p-4 sm:ml-12 sm:mr-6"
		>
			{#each patch.options as option (option.key)}
				<OptionField
					{option}
					id="option-{key}-{option.key}"
					draft={patcher.draft(patch, option.key)}
					error={patcher.optionError(patch, option.key)}
					onchange={(draft) => patcher.setDraft(patch, option.key, draft)}
				/>
			{/each}
		</div>
	{/if}
</li>
