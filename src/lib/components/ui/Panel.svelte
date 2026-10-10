<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		labelledby,
		class: className,
		children,
	}: { labelledby?: string; class?: string; children: Snippet } = $props();
</script>

<section
	aria-labelledby={labelledby}
	class={[
		'overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low',
		className,
	]}
>
	{@render children()}
</section>
