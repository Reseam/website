<script lang="ts">
	import { ToggleGroup } from 'bits-ui';

	let { tags, value = $bindable('') }: { tags: string[]; value?: string } = $props();
</script>

<ToggleGroup.Root type="single" bind:value aria-label="Filter by tag" class="flex flex-wrap gap-2">
	{#each [['', 'All'], ...tags.map((tag) => [tag, tag])] as [tag, label] (tag)}
		<ToggleGroup.Item
			value={tag}
			class="h-8 rounded-full border border-border px-3.5 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background"
		>
			{label}
		</ToggleGroup.Item>
	{/each}
</ToggleGroup.Root>
