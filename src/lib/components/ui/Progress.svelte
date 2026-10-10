<script lang="ts">
	import { Progress } from 'bits-ui';

	let { value, label }: { value: number | null; label: string } = $props();
</script>

<Progress.Root
	{value}
	max={100}
	aria-label={label}
	class="h-1.5 overflow-hidden rounded-full bg-surface-container"
>
	{#if value === null}
		<div class="h-full w-1/3 animate-indeterminate rounded-full bg-primary"></div>
	{:else}
		<div
			class="h-full rounded-full bg-primary transition-[width] duration-300 ease-emphasized"
			style:width="{value}%"
		></div>
	{/if}
</Progress.Root>
