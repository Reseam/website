<script lang="ts">
	import { Label } from 'bits-ui';
	import { SvelteSet } from 'svelte/reactivity';
	import type { AdminApi } from '#lib/admin.ts';
	import Button from '#lib/components/ui/Button.svelte';
	import type { RequestBoard } from '#lib/request-board.svelte.ts';
	import { fetchComments } from '#lib/requests.svelte.ts';
	import type { PatchRequest, RequestComment } from '#lib/types.ts';
	import CommentItem from './CommentItem.svelte';

	let {
		board,
		request,
		apiUrl,
		canWrite,
		admin,
	}: {
		board: RequestBoard;
		request: PatchRequest;
		apiUrl: string;
		canWrite: boolean;
		admin: AdminApi | undefined;
	} = $props();

	let comments = $state.raw<RequestComment[]>([]);
	let phase = $state<'loading' | 'ready' | 'failed'>('loading');
	let draft = $state('');
	let sending = $state(false);
	let error = $state('');
	const reported = new SvelteSet<number>();

	$effect(() => {
		const id = request.id;
		phase = 'loading';
		(admin ? admin.comments(id) : fetchComments(apiUrl, id)).then(
			(found) => {
				if (request.id !== id) return;
				comments = found;
				phase = 'ready';
			},
			() => {
				if (request.id === id) phase = 'failed';
			}
		);
	});

	function failed(failure: unknown) {
		error = failure instanceof Error ? failure.message : String(failure);
	}

	async function post(body: string) {
		error = '';
		sending = true;
		try {
			const posted = await (admin
				? admin.postComment(request.id, body)
				: board.voter.comment(request.id, body));
			comments = [...comments, posted];
			board.commented(posted, 1);
			draft = '';
		} catch (failure) {
			failed(failure);
		} finally {
			sending = false;
		}
	}

	function send(event: SubmitEvent) {
		event.preventDefault();
		const body = draft.trim();
		if (!body) return;
		if (admin) post(body);
		else board.withVoter(() => post(body));
	}

	async function remove(comment: RequestComment) {
		error = '';
		try {
			await (admin ? admin.deleteComment(comment.id) : board.voter.deleteComment(comment.id));
			comments = comments.filter((c) => c.id !== comment.id);
			board.commented(comment, -1);
		} catch (failure) {
			failed(failure);
		}
	}

	async function toggleHidden(comment: RequestComment) {
		error = '';
		try {
			const next = await admin!.hideComment(comment.id, !comment.hidden);
			comments = comments.map((c) => (c.id === next.id ? next : c));
		} catch (failure) {
			failed(failure);
		}
	}

	function report(comment: RequestComment) {
		board.withVoter(async () => {
			await board.voter.reportComment(comment.id);
			reported.add(comment.id);
		});
	}
</script>

<section class="grid gap-6" aria-labelledby="comments-heading">
	<h2 id="comments-heading" class="flex items-baseline gap-2 text-title-large">
		Comments
		{#if phase === 'ready' && comments.length > 0}<span
				class="text-title-medium text-on-surface-variant tabular-nums">{comments.length}</span
			>{/if}
	</h2>

	{#if phase === 'loading'}
		<p class="text-body-medium text-on-surface-variant" role="status">Loading comments…</p>
	{:else if phase === 'failed'}
		<p class="text-body-medium text-on-surface-variant" role="status">
			Comments didn't load. The API at your configured address did not answer.
		</p>
	{:else if comments.length > 0}
		<ol class="grid gap-6">
			{#each comments as comment (comment.id)}
				<CommentItem
					{comment}
					moderating={!!admin}
					mine={board.mineComment(comment)}
					reported={reported.has(comment.id)}
					canReport={canWrite}
					ontoggle={() => toggleHidden(comment)}
					onremove={() => remove(comment)}
					onreport={() => report(comment)}
				/>
			{/each}
		</ol>
	{/if}

	{#if canWrite || admin}
		<form onsubmit={send} class="grid gap-2">
			<Label.Root for="comment-body" class="text-title-small"
				>{admin ? 'Reply as the Reseam team' : 'Add a comment'}</Label.Root
			>
			<textarea
				id="comment-body"
				bind:value={draft}
				maxlength="1000"
				rows="3"
				placeholder={comments.length === 0 && phase === 'ready' ? 'Be the first to comment' : ''}
				class="field resize-y"></textarea>
			<Button type="submit" class="justify-self-end" disabled={!draft.trim() || sending}
				>{admin ? 'Reply as team' : 'Comment'}</Button
			>
		</form>
	{/if}
	{#if error}<p class="text-body-medium text-error" role="alert">{error}</p>{/if}
</section>
