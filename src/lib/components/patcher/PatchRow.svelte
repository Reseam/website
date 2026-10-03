<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Settings2 from '@lucide/svelte/icons/settings-2';
	import type { PatchMetadata } from '@reseam/browser';
	import { Collapsible, Label } from 'bits-ui';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Checkbox from '#lib/components/ui/Checkbox.svelte';
	import { plural } from '#lib/format.ts';
	import type { Patcher } from '#lib/patcher/patcher.svelte.ts';
	import { reference, runnable } from '#lib/patcher/selection.ts';
	import OptionField from './OptionField.svelte';

	let { patcher, patch }: { patcher: Patcher; patch: PatchMetadata } = $props();

	const key = $derived(reference(patch));
	const chosen = $derived(patcher.chosen.has(key));
	const requiredBy = $derived(patcher.running.get(key) ?? []);
	const included = $derived(!chosen && requiredBy.length > 0);
	const available = $derived(runnable(patch, patcher.ignoreVersions));
	const running = $derived(chosen || included);
	const errors = $derived(
		patch.options.filter((option) => patcher.optionError(patch, option.key)).length
	);

	let expanded = $state(false);
	const open = $derived(running && (expanded || errors > 0));
</script>

<li class={['px-5 py-4 transition-opacity sm:px-6', !available && 'opacity-55']}>
	<Collapsible.Root {open} onOpenChange={(value) => (expanded = value)}>
		<div class="flex items-start gap-3.5">
			<Checkbox
				id="patch-{key}"
				class="mt-0.5"
				checked={running}
				disabled={included || !available}
				aria-describedby="patch-{key}-about"
				onCheckedChange={() => patcher.toggle(patch)}
			/>
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-2">
					<Label.Root for="patch-{key}" class="cursor-pointer font-semibold"
						>{patch.name}</Label.Root
					>
					{#if patch.compatibility.kind === 'universal'}<Badge>Any app</Badge>{/if}
				</div>
				<div id="patch-{key}-about" class="text-sm text-muted-foreground">
					{#if patch.description}<p class="mt-0.5">{patch.description}</p>{/if}
					{#if included}
						<p class="mt-1 text-xs">Included for {requiredBy.map(patcher.patchName).join(', ')}</p>
					{:else if !available}
						<p class="mt-1 text-xs">Not made for this app version</p>
					{/if}
				</div>
				{#if running && patch.options.length > 0}
					<Collapsible.Trigger
						class={[
							'group mt-2 inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-foreground',
							errors > 0 ? 'text-error' : 'text-muted-foreground',
						]}
					>
						<Settings2 size={13} />
						{errors > 0
							? `${plural(errors, 'setting needs', 'settings need')} a value`
							: plural(patch.options.length, 'setting')}
						<ChevronDown
							size={13}
							class="transition-transform duration-200 group-aria-expanded:rotate-180"
						/>
					</Collapsible.Trigger>
				{/if}
			</div>
		</div>
		<Collapsible.Content class="collapsible">
			<div class="mt-3 grid gap-4 rounded-md bg-muted p-4 sm:ml-8.5">
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
		</Collapsible.Content>
	</Collapsible.Root>
</li>
