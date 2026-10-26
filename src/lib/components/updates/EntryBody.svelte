<script lang="ts">
	import type { UpdateEntry } from '#lib/updates.ts';
	import ReleaseNotes from './ReleaseNotes.svelte';

	let { entry }: { entry: UpdateEntry } = $props();
</script>

{#if entry.kind === 'news'}
	{#if entry.announcement.content}
		<p class="max-w-[72ch] text-article whitespace-pre-wrap text-on-surface">
			{entry.announcement.content}
		</p>
	{/if}
{:else}
	<ReleaseNotes notes={entry.notes} />
{/if}
