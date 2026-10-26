<script lang="ts">
	import type { Component } from 'svelte';
	import Tooltip from '#lib/components/ui/Tooltip.svelte';
	import { buttonClass, type ButtonVariant } from '#lib/components/ui/button.ts';

	let {
		label,
		icon: Icon,
		href,
		onclick,
		dot = false,
		variant = 'ghost',
		iconSize = 18,
	}: {
		label: string;
		icon: Component<{ size?: number }>;
		href?: string;
		onclick?: () => void;
		dot?: boolean;
		variant?: ButtonVariant;
		iconSize?: number;
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
			class="relative {buttonClass(variant, 'icon')}"
		>
			<Icon size={iconSize} />
			{#if dot}<span
					class="absolute top-2 right-2 size-2 rounded-full bg-primary ring-2 ring-surface"
				></span>{/if}
		</svelte:element>
	{/snippet}
</Tooltip>
