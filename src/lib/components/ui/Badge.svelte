<script lang="ts" module>
	export type BadgeTone = 'outline' | 'primary' | 'info' | 'warning' | 'error';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let { tone = 'outline', children }: { tone?: BadgeTone; children: Snippet } = $props();

	const tones: Record<BadgeTone, string> = {
		outline: 'border border-border text-muted-foreground',
		primary: 'bg-primary/15 text-primary',
		info: 'bg-info/15 text-info',
		warning: 'bg-warning/15 text-warning',
		error: 'bg-error/15 text-error',
	};
</script>

<span
	class={[
		'inline-flex h-5 shrink-0 items-center rounded-full px-2 text-xs font-medium',
		tones[tone],
	]}
>
	{@render children()}
</span>
