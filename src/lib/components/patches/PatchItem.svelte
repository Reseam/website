<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import { Collapsible } from 'bits-ui';
	import Badge from '#lib/components/ui/Badge.svelte';
	import { versionText, type CatalogPatch } from '#lib/catalog.ts';
	import { plural } from '#lib/format.ts';
	import OptionList from './OptionList.svelte';

	let { patch }: { patch: CatalogPatch } = $props();
</script>

<li class="grid gap-1 px-5 py-4 sm:px-6">
	<div class="flex flex-wrap items-center gap-2.5">
		<h3 class="text-title-medium">{patch.name}</h3>
		{#if !patch.enabled_by_default}<Badge>Optional</Badge>{/if}
	</div>
	{#if patch.description}<p class="max-w-[90ch] text-body-medium text-on-surface-variant">
			{patch.description}
		</p>{/if}
	<Collapsible.Root>
		<div
			class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-small text-on-surface-variant"
		>
			<span class="tabular-nums">{versionText(patch.versions)}</span>
			{#if patch.options.length > 0}
				<Collapsible.Trigger
					class="group inline-flex items-center gap-1 text-label-medium text-on-surface transition-colors hover:text-primary"
				>
					{plural(patch.options.length, 'setting')}
					<ChevronDown
						size={14}
						class="transition-transform duration-200 group-aria-expanded:rotate-180"
					/>
				</Collapsible.Trigger>
			{/if}
		</div>
		{#if patch.options.length > 0}
			<Collapsible.Content class="collapsible">
				<OptionList options={patch.options} />
			</Collapsible.Content>
		{/if}
	</Collapsible.Root>
</li>
