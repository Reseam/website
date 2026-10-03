<script lang="ts">
	let {
		apps,
		total,
		selected = $bindable(),
	}: {
		apps: { id: string | null; count: number }[];
		total: number;
		selected: string | null | undefined;
	} = $props();
</script>

{#snippet item(id: string | null | undefined, label: string, count: number, mono: boolean)}
	<button
		type="button"
		aria-pressed={selected === id}
		onclick={() => (selected = id)}
		class="flex w-full shrink-0 items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground aria-pressed:bg-muted aria-pressed:text-foreground max-lg:w-auto max-lg:rounded-full max-lg:border max-lg:border-border"
	>
		<span class={['flex-1 truncate max-lg:overflow-visible', mono && 'font-mono text-xs']}
			>{label}</span
		>
		<span class="text-xs tabular-nums">{count}</span>
	</button>
{/snippet}

<nav
	aria-label="Apps"
	class="flex gap-2 overflow-x-auto max-lg:-mx-(--gutter) max-lg:px-(--gutter) max-lg:[scrollbar-width:none] lg:sticky lg:top-6 lg:grid lg:gap-0.5"
>
	{@render item(undefined, 'All apps', total, false)}
	{#each apps as app (app.id)}
		{@render item(app.id, app.id ?? 'Any app', app.count, app.id !== null)}
	{/each}
</nav>
