<script lang="ts" generics="T extends string">
	import { ToggleGroup } from 'bits-ui';

	let {
		value,
		options,
		label,
		onchange,
	}: {
		value: T | undefined;
		options: { value: T; label: string }[];
		label: string;
		onchange: (value: T) => void;
	} = $props();
</script>

<ToggleGroup.Root
	type="single"
	value={value ?? ''}
	onValueChange={(next) => next && onchange(next as T)}
	aria-label={label}
	class="flex h-9 shrink-0 rounded-md border border-outline-variant p-[3px]"
>
	{#each options as option (option.value)}
		<ToggleGroup.Item
			value={option.value}
			class="flex-1 rounded-sm px-3 text-body-medium text-on-surface-variant transition-colors duration-150 hover:text-on-surface data-[state=on]:bg-surface-container data-[state=on]:text-on-surface"
		>
			{option.label}
		</ToggleGroup.Item>
	{/each}
</ToggleGroup.Root>
