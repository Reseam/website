<script lang="ts">
	import AppIcon from '#lib/components/patches/AppIcon.svelte';
	import type { AppInfo } from '#lib/types.ts';

	const SHOWN = 4;

	let { apps, names }: { apps: string[]; names: Record<string, AppInfo> } = $props();
</script>

{#if apps.length > 0}
	<span aria-hidden="true" class="flex shrink-0 -space-x-1.5">
		{#each apps.slice(0, SHOWN) as app (app)}
			<span class="rounded-full ring-2 ring-surface-container-low">
				<AppIcon icon={names[app]?.icon} size={24} />
			</span>
		{/each}
	</span>
{/if}
