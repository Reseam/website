<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import { ToggleGroup } from 'bits-ui';
	import { pillClass } from './pill.ts';

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
	{#each [{ value: '', label: m.ui_all() }, ...options] as option (option.value)}
		<ToggleGroup.Item value={option.value} class="h-8 px-3.5 {pillClass.toggle}">
			{option.label}
		</ToggleGroup.Item>
	{/each}
</ToggleGroup.Root>
