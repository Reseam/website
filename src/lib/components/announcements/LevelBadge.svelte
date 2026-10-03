<script lang="ts">
	import Badge from '#lib/components/ui/Badge.svelte';
	import { LEVELS } from '#lib/announcements.svelte.ts';
	import type { AnnouncementLevel } from '#lib/types.ts';

	let { level }: { level: AnnouncementLevel } = $props();
</script>

<Badge tone={LEVELS[level].tone}>{LEVELS[level].label}</Badge>
