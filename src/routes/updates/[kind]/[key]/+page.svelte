<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import EntryBadge from '#lib/components/updates/EntryBadge.svelte';
	import EntryBody from '#lib/components/updates/EntryBody.svelte';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { longDate } from '#lib/format.ts';
	import { entryPath, summary, type UpdateEntry } from '#lib/updates.ts';

	let { data } = $props();

	const entry = $derived(data.entry);
	const neighbours = $derived(
		[
			{ label: 'Newer', entry: data.newer },
			{ label: 'Older', entry: data.older },
		].filter((link): link is { label: string; entry: UpdateEntry } => link.entry !== null)
	);
</script>

<PageMeta
	title="{entry.title} · Reseam"
	description={summary(entry).slice(0, 160) || entry.title}
	type="article"
/>

<div class="container-page">
	<article class="mx-auto grid max-w-232 gap-4 pt-10 pb-20 sm:pt-14">
		<a
			href="/updates/"
			class="inline-flex items-center gap-1 justify-self-start text-body-medium text-on-surface-variant transition-colors hover:text-on-surface"
		>
			<ChevronLeft size={16} /> All updates
		</a>
		{#if entry.kind === 'news'}<div><EntryBadge {entry} /></div>{/if}
		<h1 class="text-headline-large sm:text-display-medium">{entry.title}</h1>
		<p class="flex flex-wrap gap-3 text-body-medium text-on-surface-variant">
			<time datetime={entry.date}>{longDate(entry.date)}</time>
			{#if entry.kind === 'news'}
				{#if entry.announcement.author}<span>by {entry.announcement.author}</span>{/if}
			{:else if entry.notes.engine}
				<span>Needs engine {entry.notes.engine}</span>
			{/if}
		</p>
		<div class="mt-2 border-t border-outline-variant pt-6">
			<EntryBody {entry} />
		</div>
		{#if entry.kind === 'patches'}
			<div class="flex flex-wrap gap-3 pt-2">
				<Button href="/download/">Get Reseam Manager</Button>
				<Button href={entry.downloadUrl} variant="outline">Bundle file</Button>
			</div>
		{/if}
		{#if neighbours.length > 0}
			<nav aria-label="Other updates" class="mt-6 grid gap-3 sm:grid-cols-2">
				{#each neighbours as link (link.label)}
					<a
						href={entryPath(link.entry)}
						class="grid gap-0.5 rounded-lg border border-outline-variant px-5 py-4 transition-colors hover:bg-surface-container"
					>
						<span class="text-body-small text-on-surface-variant">{link.label}</span>
						<span class="text-title-medium">{link.entry.title}</span>
					</a>
				{/each}
			</nav>
		{/if}
	</article>
</div>
