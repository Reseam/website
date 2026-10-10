<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import { Checkbox, type WithoutChildrenOrChild } from 'bits-ui';

	let {
		checked = $bindable(false),
		class: className,
		...rest
	}: WithoutChildrenOrChild<Checkbox.RootProps> = $props();
</script>

<Checkbox.Root
	bind:checked
	class={[
		'grid size-5 shrink-0 place-items-center rounded-sm border border-on-surface-variant transition-colors duration-150 aria-checked:border-primary aria-checked:bg-primary data-disabled:opacity-50',
		className,
	]}
	{...rest}
>
	{#snippet children({ checked })}
		<Check
			size={14}
			strokeWidth={3.5}
			class="text-on-primary transition-[opacity,scale] duration-150 {checked
				? 'scale-100 opacity-100'
				: 'scale-50 opacity-0'}"
		/>
	{/snippet}
</Checkbox.Root>
