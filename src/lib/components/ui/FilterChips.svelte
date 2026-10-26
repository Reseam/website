<script lang="ts">
	import { ToggleGroup } from 'bits-ui';

	let {
		options,
		value = $bindable(''),
		label,
	}: {
		options: readonly { value: string; label: string }[];
		value?: string;
		label: string;
	} = $props();
</script>

<ToggleGroup.Root type="single" bind:value aria-label={label} class="flex flex-wrap gap-2">
	{#each [{ value: '', label: 'All' }, ...options] as option (option.value)}
		<ToggleGroup.Item
			value={option.value}
			class="h-8 rounded-full border border-outline-variant px-3.5 text-body-medium text-on-surface-variant transition-colors duration-150 hover:text-on-surface data-[state=on]:border-on-surface data-[state=on]:bg-on-surface data-[state=on]:text-surface"
		>
			{option.label}
		</ToggleGroup.Item>
	{/each}
</ToggleGroup.Root>
