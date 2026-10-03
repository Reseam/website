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
	class="flex h-9 shrink-0 rounded-md border border-border p-[3px]"
>
	{#each options as option (option.value)}
		<ToggleGroup.Item
			value={option.value}
			class="flex-1 rounded-sm px-3 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground"
		>
			{option.label}
		</ToggleGroup.Item>
	{/each}
</ToggleGroup.Root>
