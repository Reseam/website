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
		'grid size-5 shrink-0 place-items-center rounded-[0.375rem] border-[1.5px] border-muted-foreground transition-colors duration-150 aria-checked:border-primary aria-checked:bg-primary data-disabled:opacity-50',
		className,
	]}
	{...rest}
>
	{#snippet children({ checked })}
		<Check
			size={14}
			strokeWidth={3.5}
			class="text-primary-foreground transition-[opacity,scale] duration-150 {checked
				? 'scale-100 opacity-100'
				: 'scale-50 opacity-0'}"
		/>
	{/snippet}
</Checkbox.Root>
