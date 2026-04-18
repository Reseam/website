<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { cn } from '$lib/cn';

	type Variant = 'default' | 'ghost' | 'outlined';
	type Size = 'default' | 'sm' | 'lg' | 'icon';

	type Props = HTMLButtonAttributes & {
		variant?: Variant;
		size?: Size;
		class?: string;
		children?: Snippet;
	};

	let {
		variant = 'default',
		size = 'default',
		class: className,
		children,
		...rest
	}: Props = $props();

	const base =
		'inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius)] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

	const variants = {
		default: 'bg-primary text-primary-foreground hover:bg-primary/90',
		ghost: 'hover:bg-accent hover:text-accent-foreground',
		outlined: 'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground'
	};

	const sizes = {
		default: 'h-10 px-5 py-2',
		sm: 'h-8 px-3',
		lg: 'h-12 px-8 text-base',
		icon: 'h-10 w-10'
	};
</script>

<button class={cn(base, variants[variant], sizes[size], className)} {...rest}>
	{@render children?.()}
</button>
