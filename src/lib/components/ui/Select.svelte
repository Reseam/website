<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import Check from '@lucide/svelte/icons/check';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import { Select } from 'bits-ui';

	let {
		id,
		value,
		items,
		placeholder = m.ui_choose(),
		invalid = false,
		describedby,
		labelOf = (item) => item,
		onchange,
	}: {
		id: string;
		value: string;
		items: string[];
		placeholder?: string;
		invalid?: boolean;
		describedby?: string;
		labelOf?: (item: string) => string;
		onchange: (value: string) => void;
	} = $props();
</script>

<Select.Root
	type="single"
	{value}
	items={items.map((item) => ({ value: item, label: labelOf(item) }))}
	onValueChange={onchange}
>
	<Select.Trigger
		{id}
		aria-invalid={invalid || undefined}
		aria-describedby={describedby}
		class="field flex items-center justify-between gap-2 text-left data-placeholder:text-on-surface-variant"
	>
		<span class="truncate">{value ? labelOf(value) : placeholder}</span>
		<ChevronsUpDown size={15} class="shrink-0 text-on-surface-variant" />
	</Select.Trigger>
	<Select.Portal>
		<Select.Content
			sideOffset={6}
			class="menu max-h-72 w-(--bits-select-anchor-width) overflow-hidden"
		>
			<Select.Viewport class="p-1">
				{#each items as item (item)}
					<Select.Item value={item} label={labelOf(item)} class="menu-item">
						{#snippet children({ selected })}
							<span class="truncate">{labelOf(item)}</span>
							{#if selected}<Check size={15} class="text-primary" />{/if}
						{/snippet}
					</Select.Item>
				{/each}
			</Select.Viewport>
		</Select.Content>
	</Select.Portal>
</Select.Root>
