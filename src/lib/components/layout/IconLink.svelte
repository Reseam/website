<script lang="ts">
	import type { Component } from 'svelte';
	import Tooltip from '#lib/components/ui/Tooltip.svelte';
	import { buttonClass } from '#lib/components/ui/button.ts';

	let {
		label,
		icon: Icon,
		href,
		onclick,
		dot = false,
	}: {
		label: string;
		icon: Component<{ size?: number }>;
		href?: string;
		onclick?: () => void;
		dot?: boolean;
	} = $props();
</script>

<Tooltip text={label}>
	{#snippet trigger({ props })}
		<svelte:element
			this={href ? 'a' : 'button'}
			{...props}
			{href}
			{onclick}
			type={href ? undefined : 'button'}
			aria-label={label}
			class="relative {buttonClass('ghost', 'icon')}"
		>
			<Icon size={18} />
			{#if dot}<span
					class="absolute top-2 right-2 size-2 rounded-full bg-primary ring-2 ring-background"
				></span>{/if}
		</svelte:element>
	{/snippet}
</Tooltip>
