<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Settings2 from '@lucide/svelte/icons/settings-2';
	import { patchText, type PatchMetadata } from '@reseam/browser';
	import { Collapsible, Label } from 'bits-ui';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Checkbox from '#lib/components/ui/Checkbox.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { Patcher } from '#lib/patcher/patcher.svelte.ts';
	import { reference } from '#lib/patcher/patches.ts';
	import OptionField from './OptionField.svelte';

	let { patcher, patch }: { patcher: Patcher; patch: PatchMetadata } = $props();

	const key = $derived(reference(patch));
	const text = $derived(patchText(patch, [getLocale()]));
	const optionText = (key: string) => text.options.find((entry) => entry.key === key)!;
	const planned = $derived(patcher.planned.get(key));
	const running = $derived(patcher.running.has(key));
	const requiredBy = $derived(planned?.required_by ?? []);
	const included = $derived(running && !planned?.selected);
	const available = $derived(!planned?.incompatibility || patcher.choice.ignore_versions);
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
					<Label.Root for="patch-{key}" class="cursor-pointer text-title-medium"
						>{text.name}</Label.Root
					>
					{#if patch.compatibility.kind === 'universal'}<Badge>{m.catalog_any_app()}</Badge>{/if}
				</div>
				<div id="patch-{key}-about" class="text-body-medium text-on-surface-variant">
					{#if text.description}<p class="mt-0.5">{text.description}</p>{/if}
					{#if included}
						<p class="mt-1 text-body-small">
							{m.patcher_included_for({
								patches: new Intl.ListFormat(getLocale()).format(requiredBy.map(patcher.patchName)),
							})}
						</p>
					{:else if !available}
						<p class="mt-1 text-body-small">{m.patcher_wrong_version()}</p>
					{/if}
				</div>
				{#if running && patch.options.length > 0}
					<Collapsible.Trigger
						class={[
							'group mt-2 inline-flex items-center gap-1.5 text-label-medium transition-colors hover:text-on-surface',
							errors > 0 ? 'text-error' : 'text-on-surface-variant',
						]}
					>
						<Settings2 size={13} />
						{errors > 0
							? m.patcher_settings_need_value({ count: errors })
							: m.patches_settings_count({ count: patch.options.length })}
						<ChevronDown
							size={13}
							class="transition-transform duration-200 group-aria-expanded:rotate-180"
						/>
					</Collapsible.Trigger>
				{/if}
			</div>
		</div>
		<Collapsible.Content class="collapsible">
			<div class="mt-3 grid gap-4 rounded-md bg-surface-container p-4 sm:ml-8.5">
				{#each patch.options as option (option.key)}
					<OptionField
						{option}
						text={optionText(option.key)}
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
