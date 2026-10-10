<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, children }: { label: string; children: Snippet } = $props();
</script>

<div
	role="img"
	aria-label={label}
	class="flex h-60 select-none items-end justify-center overflow-hidden rounded-xl border border-outline-variant bg-[radial-gradient(90%_70%_at_50%_100%,color-mix(in_oklch,var(--color-primary)_8%,transparent),transparent_70%)] bg-surface-container-low"
>
	<div
		class="relative grid h-52 w-52 content-start gap-2 rounded-t-xl-increased border-6 border-b-0 border-phone-dark-line bg-phone-dark px-3 pt-7 text-body-small text-phone-light-line shadow-elevation-3"
	>
		<span class="absolute inset-x-0 top-0 mx-auto h-3 w-16 rounded-b-md bg-phone-dark-line/60"
		></span>
		{@render children()}
	</div>
</div>
