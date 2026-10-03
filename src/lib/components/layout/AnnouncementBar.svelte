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
	class="group flex items-center justify-center gap-3 border-b border-border bg-primary/5 px-4 py-2.5 text-sm transition-colors hover:bg-primary/10"
>
	<Badge tone={level.tone}>{level.label}</Badge>
	<span class="min-w-0 truncate font-medium">{announcement.title}</span>
	<span
		class="hidden shrink-0 items-center gap-1 text-muted-foreground transition-colors group-hover:text-foreground sm:inline-flex"
	>
		Read <ArrowRight
			size={14}
			class="transition-transform duration-200 group-hover:translate-x-0.5"
		/>
	</span>
</a>
