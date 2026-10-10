<script lang="ts">
	import { ToggleGroup } from 'bits-ui';

	let { tags, value = $bindable('') }: { tags: string[]; value?: string } = $props();
</script>

<ToggleGroup.Root type="single" bind:value aria-label="Filter by tag" class="flex flex-wrap gap-2">
	{#each [['', 'All'], ...tags.map((tag) => [tag, tag])] as [tag, label] (tag)}
		<ToggleGroup.Item
			value={tag}
			class="h-8 rounded-full border border-outline-variant px-3.5 text-body-medium text-on-surface-variant transition-colors duration-150 hover:text-on-surface data-[state=on]:border-on-surface data-[state=on]:bg-on-surface data-[state=on]:text-surface"
		>
			{label}
		</ToggleGroup.Item>
	{/each}
</ToggleGroup.Root>
