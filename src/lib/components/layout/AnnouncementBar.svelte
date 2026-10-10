<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Badge from '#lib/components/ui/Badge.svelte';
	import { LEVELS } from '#lib/announcements.svelte.ts';
	import type { Announcement } from '#lib/types.ts';

	let { announcement }: { announcement: Announcement } = $props();
	const level = $derived(LEVELS[announcement.level]);
</script>

<a
	href="/announcements/{announcement.id}/"
	class="group flex items-center justify-center gap-3 border-b border-outline-variant bg-surface-container px-4 py-2.5 transition-colors hover:bg-surface-container-high"
>
	<Badge tone={level.tone}>{level.label}</Badge>
	<span class="min-w-0 truncate text-label-large text-on-surface">{announcement.title}</span>
	<span
		class="hidden shrink-0 items-center gap-1 text-body-medium text-on-surface-variant transition-colors group-hover:text-on-surface sm:inline-flex"
	>
		Read <ArrowRight
			size={14}
			class="transition-transform duration-200 group-hover:translate-x-0.5"
		/>
	</span>
</a>
