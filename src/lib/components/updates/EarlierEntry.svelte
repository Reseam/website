<script lang="ts">
	import { shortDate } from '#lib/format.ts';
	import { entryPath, summary, type UpdateEntry } from '#lib/updates.ts';
	import EntryBadge from './EntryBadge.svelte';

	let { entry }: { entry: UpdateEntry } = $props();

	const text = $derived(summary(entry));
</script>

<li class="grid gap-1 py-4 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-6">
	<time
		datetime={entry.date}
		class="text-body-medium text-on-surface-variant tabular-nums sm:pt-0.5"
	>
		{shortDate(entry.date)}
	</time>
	<a href={entryPath(entry)} class="group grid gap-1.5">
		<span class="flex flex-wrap items-center gap-2.5">
			<span class="text-title-medium transition-colors group-hover:text-primary">{entry.title}</span
			>
			<EntryBadge {entry} />
		</span>
		{#if text}
			<span class="line-clamp-2 text-body-medium text-on-surface-variant">{text}</span>
		{:else if entry.kind !== 'news' && entry.notes.engine}
			<span class="text-body-medium text-on-surface-variant"
				>Runs on engine {entry.notes.engine}</span
			>
		{/if}
	</a>
</li>
