<script lang="ts">
	import Markdown from '#lib/components/ui/Markdown.svelte';
	import type { UpdateEntry } from '#lib/updates.ts';
	import ReleaseNotes from './ReleaseNotes.svelte';

	let { entry }: { entry: UpdateEntry } = $props();
</script>

{#if entry.kind === 'news'}
	{#if entry.announcement.content}
		<Markdown text={entry.announcement.content} class="max-w-[72ch] text-article text-on-surface" />
	{/if}
{:else}
	<ReleaseNotes notes={entry.notes} />
{/if}
