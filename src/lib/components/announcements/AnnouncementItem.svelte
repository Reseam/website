<script lang="ts">
	import { recentDate } from '#lib/format.ts';
	import type { Announcement } from '#lib/types.ts';
	import LevelBadge from './LevelBadge.svelte';

	let { announcement }: { announcement: Announcement } = $props();
</script>

<li>
	<a
		href="/announcements/{announcement.id}/"
		class="grid gap-1.5 px-5 py-4 transition-colors hover:bg-surface-container sm:px-6"
	>
		<span class="flex flex-wrap items-center gap-2.5">
			<LevelBadge level={announcement.level} />
			<span class="min-w-0 flex-1 text-title-medium">{announcement.title}</span>
			<time
				datetime={announcement.created_at}
				class="text-body-medium text-on-surface-variant tabular-nums"
				>{recentDate(announcement.created_at)}</time
			>
		</span>
		{#if announcement.content}<span class="line-clamp-2 text-body-medium text-on-surface-variant"
				>{announcement.content}</span
			>{/if}
		{#if announcement.tags.length > 0}
			<span class="flex flex-wrap gap-2 text-body-small text-on-surface-variant">
				{#each announcement.tags as tag (tag)}<span>#{tag}</span>{/each}
			</span>
		{/if}
	</a>
</li>
