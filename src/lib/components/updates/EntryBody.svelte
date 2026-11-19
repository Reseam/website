<script lang="ts">
	import Markdown from '#lib/components/ui/Markdown.svelte';
	import { mediaOf } from '#lib/notes.ts';
	import type { UpdateEntry } from '#lib/updates.ts';
	import ReleaseMedia from './ReleaseMedia.svelte';
	import ReleaseNotes from './ReleaseNotes.svelte';

	let { entry }: { entry: UpdateEntry } = $props();
</script>

{#if entry.kind === 'news'}
	{@const news = mediaOf(entry.announcement.content ?? '')}
	<div class="grid gap-6">
		{#if news.media.length > 0}<ReleaseMedia media={news.media} embed />{/if}
		{#if news.text}
			<Markdown text={news.text} class="max-w-[72ch] text-article text-on-surface" />
		{/if}
	</div>
{:else}
	<ReleaseNotes notes={entry.notes} embedMedia />
{/if}
