<script lang="ts">
	import { Tooltip } from 'bits-ui';
	import type { Snippet } from 'svelte';

	let { text, trigger }: { text: string; trigger: Snippet<[{ props: Record<string, unknown> }]> } =
		$props();
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		{#snippet child({ props })}
			{@render trigger({ props })}
		{/snippet}
	</Tooltip.Trigger>
	<Tooltip.Portal>
		<Tooltip.Content
			sideOffset={6}
			class="z-50 rounded-sm border border-outline-variant bg-surface-container-low px-2.5 py-1 text-body-small text-on-surface shadow-elevation-3 transition-[opacity,translate] duration-150 data-starting-style:-translate-y-0.5 data-starting-style:opacity-0 data-ending-style:opacity-0"
		>
			{text}
		</Tooltip.Content>
	</Tooltip.Portal>
</Tooltip.Root>
