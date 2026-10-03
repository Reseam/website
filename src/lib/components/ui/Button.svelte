<script lang="ts">
	import { Button } from 'bits-ui';
	import { buttonClass, type ButtonSize, type ButtonVariant } from './button';

	let {
		variant = 'primary',
		size = 'md',
		class: className,
		...rest
	}: Button.RootProps & { variant?: ButtonVariant; size?: ButtonSize } = $props();
</script>

<Button.Root class={[buttonClass(variant, size), className]} {...rest} />
