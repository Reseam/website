<script lang="ts">
	import type { AppInfo } from '#lib/types.ts';
	import AppIcon from './AppIcon.svelte';

	let {
		apps,
		total,
		selected = $bindable(),
	}: {
		apps: { id: string | null; count: number; info?: AppInfo }[];
		total: number;
		selected: string | null | undefined;
	} = $props();
</script>

{#snippet item(id: string | null | undefined, count: number, info?: AppInfo)}
	<button
		type="button"
		aria-pressed={selected === id}
		onclick={() => (selected = id)}
		class="flex w-full shrink-0 items-center gap-3 rounded-md px-3 py-2 text-left text-body-medium text-on-surface-variant transition-colors hover:text-on-surface aria-pressed:bg-surface-container aria-pressed:text-on-surface max-lg:w-auto max-lg:rounded-full max-lg:border max-lg:border-outline-variant"
	>
		{#if id}<AppIcon icon={info?.icon} size={20} />{/if}
		<span
			class={['flex-1 truncate max-lg:overflow-visible', id && !info && 'font-mono text-mono-xs']}
			title={info ? id : undefined}
			>{id === undefined ? 'All apps' : (info?.name ?? id ?? 'Any app')}</span
		>
		<span class="text-body-small tabular-nums">{count}</span>
	</button>
{/snippet}

<nav
	aria-label="Apps"
	class="flex gap-2 overflow-x-auto max-lg:-mx-(--gutter) max-lg:px-(--gutter) max-lg:[scrollbar-width:none] lg:sticky lg:top-6 lg:grid lg:gap-0.5"
>
	{@render item(undefined, total)}
	{#each apps as app (app.id)}
		{@render item(app.id, app.count, app.info)}
	{/each}
</nav>
