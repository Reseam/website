<script lang="ts">
	import { onMount } from 'svelte';
	import type { AdminApi } from '#lib/admin.ts';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { recentDate } from '#lib/format.ts';
	import type { RequestComment } from '#lib/types.ts';

	let { requestId, api }: { requestId: number; api: AdminApi } = $props();

	let comments = $state.raw<RequestComment[]>([]);
	let loaded = $state(false);
	let draft = $state('');
	let busy = $state(false);
	let error = $state('');

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

	onMount(() =>
		run(async () => {
			comments = await api.comments(requestId);
			loaded = true;
		})
	);

	function replace(next: RequestComment) {
		comments = comments.map((comment) => (comment.id === next.id ? next : comment));
	}

	function reply(event: SubmitEvent) {
		event.preventDefault();
		run(async () => {
			comments = [...comments, await api.postComment(requestId, draft.trim())];
			draft = '';
		});
	}

	const remove = (comment: RequestComment) =>
		run(async () => {
			if (!confirm('Delete this comment?')) return;
			await api.deleteComment(comment.id);
			comments = comments.filter((c) => c.id !== comment.id);
		});
</script>

<div class="grid gap-3 border-l-2 border-outline-variant pl-4">
	{#if loaded && comments.length === 0}
		<p class="text-body-medium text-on-surface-variant">No comments.</p>
	{/if}
	{#each comments as comment (comment.id)}
		<div class="grid gap-1">
			<p class="flex flex-wrap items-center gap-2 text-body-small text-on-surface-variant">
				{#if comment.team}<Badge tone="primary">Reseam team</Badge>{/if}
				<span>{recentDate(comment.created_at)}</span>
				{#if comment.hidden}<span class="text-label-medium text-error">Hidden</span>{/if}
			</p>
			<p class="text-body-medium whitespace-pre-wrap">{comment.body}</p>
			<div class="flex gap-2">
				<Button
					size="sm"
					variant="ghost"
					disabled={busy}
					onclick={() =>
						run(async () => replace(await api.hideComment(comment.id, !comment.hidden)))}
					>{comment.hidden ? 'Show' : 'Hide'}</Button
				>
				<Button size="sm" variant="ghost" disabled={busy} onclick={() => remove(comment)}
					>Delete</Button
				>
			</div>
		</div>
	{/each}
	<form onsubmit={reply} class="grid gap-2">
		<textarea
			bind:value={draft}
			maxlength="1000"
			rows="2"
			aria-label="Reply as the Reseam team"
			placeholder="Reply as the Reseam team"
			class="field resize-y"></textarea>
		<Button type="submit" size="sm" class="justify-self-start" disabled={busy || !draft.trim()}
			>Reply</Button
		>
	</form>
	{#if error}<p class="text-body-medium text-error" role="alert">{error}</p>{/if}
</div>
