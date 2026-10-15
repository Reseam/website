<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		id,
		title,
		subtitle,
		children,
		action,
	}: { id: string; title: string; subtitle: string; children?: Snippet; action: Snippet } =
		$props();
</script>

<section aria-labelledby={id} class="container-page">
	<div
		class="flex flex-wrap items-center justify-between gap-8 border-t border-outline-variant py-16"
	>
		<div>
			<h2 {id} class="text-headline-medium sm:text-display-small">{title}</h2>
			<p class="mt-2 text-body-large text-on-surface-variant">{subtitle}</p>
			{@render children?.()}
		</div>
		{@render action()}
	</div>
</section>
