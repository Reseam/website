<script lang="ts">
	import { Label } from 'bits-ui';
	import type { AdminApi } from '#lib/admin.ts';
	import LevelBadge from '#lib/components/announcements/LevelBadge.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import { LEVELS } from '#lib/announcements.svelte.ts';
	import { recentDate } from '#lib/format.ts';
	import type { Announcement, AnnouncementLevel } from '#lib/types.ts';

	let { api }: { api: AdminApi } = $props();

	let announcements = $state.raw<Announcement[]>([]);
	let title = $state('');
	let content = $state('');
	let level = $state<AnnouncementLevel>(0);
	let tags = $state('');
	let error = $state('');
	let busy = $state(false);

	$effect(() => {
		api.announcements().then(
			(list) => (announcements = list),
			(failure) => (error = failure.message)
		);
	});

	async function run(action: () => Promise<void>) {
		error = '';
		busy = true;
		try {
			await action();
		} catch (failure) {
			error = failure instanceof Error ? failure.message : String(failure);
		} finally {
			busy = false;
		}
	}

	function post(event: SubmitEvent) {
		event.preventDefault();
		run(async () => {
			const created = await api.postAnnouncement({
				title: title.trim(),
				content: content.trim() || undefined,
				level,
				tags: tags
					.split(',')
					.map((tag) => tag.trim())
					.filter(Boolean),
			});
			announcements = [created, ...announcements];
			title = content = tags = '';
			level = 0;
		});
	}

	function replace(next: Announcement) {
		announcements = announcements.map((a) => (a.id === next.id ? next : a));
	}
</script>

<form
	onsubmit={post}
	class="grid gap-4 rounded-xl border border-outline-variant bg-surface-container-low p-5 sm:p-6"
>
	<h2 class="text-title-large">New announcement</h2>
	<p class="text-body-medium text-on-surface-variant">
		Posted to the site, Reseam Manager and the socials.
	</p>
	<div class="grid gap-2">
		<Label.Root for="announcement-title" class="text-label-large">Title</Label.Root>
		<input id="announcement-title" bind:value={title} required class="field" />
	</div>
	<div class="grid gap-2">
		<Label.Root for="announcement-content" class="text-label-large">Text</Label.Root>
		<textarea id="announcement-content" bind:value={content} rows="4" class="field resize-y"
		></textarea>
	</div>
	<div class="grid gap-4 sm:grid-cols-2">
		<div class="grid gap-2">
			<Label.Root for="announcement-level" class="text-label-large">Level</Label.Root>
			<Select
				id="announcement-level"
				value={String(level)}
				items={Object.keys(LEVELS)}
				labelOf={(item) => LEVELS[Number(item) as AnnouncementLevel].label}
				onchange={(next) => (level = Number(next) as AnnouncementLevel)}
			/>
		</div>
		<div class="grid gap-2">
			<Label.Root for="announcement-tags" class="text-label-large">Tags</Label.Root>
			<input id="announcement-tags" bind:value={tags} placeholder="status, youtube" class="field" />
		</div>
	</div>
	<Button type="submit" class="justify-self-start" disabled={busy || !title.trim()}>Post</Button>
</form>

{#if error}<p class="text-body-medium text-error" role="alert">{error}</p>{/if}

<ul
	class="divide-y divide-outline-variant overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low"
>
	{#each announcements as announcement (announcement.id)}
		<li class="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
			<LevelBadge level={announcement.level} />
			<span class="min-w-0 flex-1 text-title-medium">{announcement.title}</span>
			<span class="text-body-small text-on-surface-variant">
				{announcement.archived_at ? 'Archived' : recentDate(announcement.created_at)}
			</span>
			<Button
				size="sm"
				variant="ghost"
				disabled={busy}
				onclick={() =>
					run(async () =>
						replace(await api.archiveAnnouncement(announcement.id, !announcement.archived_at))
					)}>{announcement.archived_at ? 'Restore' : 'Archive'}</Button
			>
			<Button
				size="sm"
				variant="ghost"
				disabled={busy}
				onclick={() =>
					run(async () => {
						if (!confirm('Delete this announcement for good?')) return;
						await api.deleteAnnouncement(announcement.id);
						announcements = announcements.filter((a) => a.id !== announcement.id);
					})}>Delete</Button
			>
		</li>
	{:else}
		<li class="px-6 py-10 text-center text-on-surface-variant">No announcements.</li>
	{/each}
</ul>
