<script lang="ts">
	import { Switch, type WithoutChildrenOrChild } from 'bits-ui';

	let {
		checked = $bindable(false),
		class: className,
		...rest
	}: WithoutChildrenOrChild<Switch.RootProps> = $props();
</script>

<Switch.Root
	bind:checked
	class={[
		'inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-outline-variant bg-surface-container p-[3px] transition-colors duration-200 aria-checked:border-primary aria-checked:bg-primary',
		className,
	]}
	{...rest}
>
	<Switch.Thumb
		class="size-4 rounded-full bg-on-surface-variant transition-[translate,background-color] duration-300 ease-spring data-[state=checked]:translate-x-4 data-[state=checked]:bg-on-primary"
	/>
</Switch.Root>
