<script lang="ts">
	import LevelBadge from '#lib/components/announcements/LevelBadge.svelte';
	import type { UpdateEntry } from '#lib/updates.ts';

	let { entry }: { entry: UpdateEntry } = $props();
</script>

{#if entry.kind === 'news'}<LevelBadge level={entry.announcement.level} />{/if}
