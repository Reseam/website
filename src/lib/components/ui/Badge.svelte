<script lang="ts" module>
	export type BadgeTone = 'outline' | 'primary' | 'info' | 'warning' | 'error';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let { tone = 'outline', children }: { tone?: BadgeTone; children: Snippet } = $props();

	const tones: Record<BadgeTone, string> = {
		outline: 'border border-outline-variant text-on-surface-variant',
		primary: 'bg-secondary-container text-primary',
		info: 'bg-tertiary-container text-tertiary',
		warning: 'bg-warning-container text-warning',
		error: 'bg-error-container text-error',
	};
</script>

<span
	class={['inline-flex h-5 shrink-0 items-center rounded-full px-2 text-label-medium', tones[tone]]}
>
	{@render children()}
</span>
