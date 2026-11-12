<script lang="ts">
	import type { CatalogPatch } from '#lib/catalog.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { AppInfo } from '#lib/types.ts';
	import AppIcon from './AppIcon.svelte';
	import PatchItem from './PatchItem.svelte';

	let {
		app,
		info,
		patches,
	}: { app: string | null; info: AppInfo | undefined; patches: CatalogPatch[] } = $props();
</script>

<section aria-label={info?.name ?? app ?? m.catalog_any_app()}>
	<header class="flex items-center justify-between gap-3 px-1 pb-2.5">
		{#if info}
			<div class="flex min-w-0 items-center gap-3">
				<AppIcon icon={info.icon} size={32} />
				<div class="grid min-w-0">
					<h2 class="truncate text-title-small">{info.name}</h2>
					<span class="truncate font-mono text-mono-xs text-on-surface-variant">{app}</span>
				</div>
			</div>
		{:else}
			<h2 class={app ? 'truncate font-mono text-mono-sm-semibold' : 'text-title-small'}>
				{app ?? m.catalog_any_app()}
			</h2>
		{/if}
		<span class="shrink-0 text-body-medium text-on-surface-variant tabular-nums"
			>{m.patcher_patch_count({ count: patches.length })}</span
		>
	</header>
	<ul
		class="divide-y divide-outline-variant overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low"
	>
		{#each patches as patch (patch.id)}<PatchItem {patch} />{/each}
	</ul>
</section>
