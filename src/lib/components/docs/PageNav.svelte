<script lang="ts">
	import type { DocLink } from '#lib/docs/types.ts';

	let {
		previous,
		next,
	}: { previous?: Pick<DocLink, 'slug' | 'title'>; next?: Pick<DocLink, 'slug' | 'title'> } =
		$props();
</script>

{#snippet card(link: Pick<DocLink, 'slug' | 'title'>, label: string, end: boolean)}
	<a
		href="/docs/{link.slug}/"
		class={[
			'grid gap-0.5 rounded-lg border border-outline-variant px-4 py-3.5 transition-colors hover:border-primary/40',
			end && 'col-start-2 text-right',
		]}
	>
		<span class="text-body-small text-on-surface-variant">{label}</span>
		<span class="text-title-medium">{link.title}</span>
	</a>
{/snippet}

<nav
	aria-label="Pages"
	class="grid max-w-[80ch] grid-cols-2 gap-3 border-t border-outline-variant pt-6"
>
	{#if previous}{@render card(previous, 'Previous', false)}{/if}
	{#if next}{@render card(next, 'Next', true)}{/if}
</nav>
