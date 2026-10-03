<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ChevronsUpDown from '@lucide/svelte/icons/chevrons-up-down';
	import { Select } from 'bits-ui';

	let {
		id,
		value,
		items,
		placeholder = 'Choose…',
		invalid = false,
		describedby,
		onchange,
	}: {
		id: string;
		value: string;
		items: string[];
		placeholder?: string;
		invalid?: boolean;
		describedby?: string;
		onchange: (value: string) => void;
	} = $props();
</script>

<Select.Root
	type="single"
	{value}
	items={items.map((item) => ({ value: item, label: item }))}
	onValueChange={onchange}
>
	<Select.Trigger
		{id}
		aria-invalid={invalid || undefined}
		aria-describedby={describedby}
		class="field flex items-center justify-between gap-2 text-left data-placeholder:text-muted-foreground"
	>
		<span class="truncate">{value || placeholder}</span>
		<ChevronsUpDown size={15} class="shrink-0 text-muted-foreground" />
	</Select.Trigger>
	<Select.Portal>
		<Select.Content
			sideOffset={6}
			class="z-50 max-h-72 w-(--bits-select-anchor-width) overflow-hidden rounded-md border border-border bg-card shadow-float transition-[opacity,scale] duration-150 data-ending-style:scale-98 data-ending-style:opacity-0 data-starting-style:scale-98 data-starting-style:opacity-0"
		>
			<Select.Viewport class="p-1">
				{#each items as item (item)}
					<Select.Item
						value={item}
						label={item}
						class="flex h-9 items-center justify-between gap-2 rounded-sm px-2.5 text-sm outline-none data-highlighted:bg-muted"
					>
						{#snippet children({ selected })}
							<span class="truncate">{item}</span>
							{#if selected}<Check size={15} class="text-primary" />{/if}
						{/snippet}
					</Select.Item>
				{/each}
			</Select.Viewport>
		</Select.Content>
	</Select.Portal>
</Select.Root>
