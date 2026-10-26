<script lang="ts">
	import { Label } from 'bits-ui';
	import { SvelteSet } from 'svelte/reactivity';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { recentDate } from '#lib/format.ts';
	import type { RequestBoard } from '#lib/request-board.svelte.ts';
	import { fetchComments } from '#lib/requests.svelte.ts';
	import type { PatchRequest, RequestComment } from '#lib/types.ts';

	let {
		board,
		request,
		apiUrl,
		canWrite,
	}: { board: RequestBoard; request: PatchRequest; apiUrl: string; canWrite: boolean } = $props();

	let comments = $state.raw<RequestComment[]>([]);
	let phase = $state<'loading' | 'ready' | 'failed'>('loading');
	let draft = $state('');
	let sending = $state(false);
	let error = $state('');
	const reported = new SvelteSet<number>();

	$effect(() => {
		const id = request.id;
		phase = 'loading';
		fetchComments(apiUrl, id).then(
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

	function send(event: SubmitEvent) {
		event.preventDefault();
		const body = draft.trim();
		if (!body) return;
		board.withVoter(async () => {
			error = '';
			sending = true;
			try {
				const posted = await board.voter.comment(request.id, body);
				comments = [...comments, posted];
				board.commented(posted, 1);
				draft = '';
			} catch (failure) {
				failed(failure);
			} finally {
				sending = false;
			}
		});
	}

	async function remove(comment: RequestComment) {
		error = '';
		try {
			await board.voter.deleteComment(comment.id);
			comments = comments.filter((c) => c.id !== comment.id);
			board.commented(comment, -1);
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

<section class="grid gap-4 border-t border-outline-variant pt-6" aria-labelledby="comments-heading">
	<h2 id="comments-heading" class="text-title-large">Comments</h2>

	{#if phase === 'loading'}
		<p class="text-body-medium text-on-surface-variant" role="status">Loading comments…</p>
	{:else if phase === 'failed'}
		<p class="text-body-medium text-on-surface-variant" role="status">
			Comments didn't load. The API at your configured address did not answer.
		</p>
	{:else if comments.length === 0}
		<p class="text-body-medium text-on-surface-variant">No comments yet.</p>
	{:else}
		<ol class="grid gap-3">
			{#each comments as comment (comment.id)}
				<li
					class={[
						'grid gap-2 rounded-xl border px-5 py-4',
						comment.team
							? 'border-primary/40 bg-secondary-container/40'
							: 'border-outline-variant bg-surface-container-low',
					]}
				>
					<p class="flex flex-wrap items-center gap-2 text-body-small text-on-surface-variant">
						{#if comment.team}<Badge tone="primary">Reseam team</Badge>{/if}
						<time datetime={comment.created_at}>{recentDate(comment.created_at)}</time>
						{#if comment.hidden}<span class="text-warning"
								>Held as possible spam. Only you see it.</span
							>{/if}
					</p>
					<p class="text-body-large whitespace-pre-wrap">{comment.body}</p>
					<div class="text-label-large text-on-surface-variant">
						{#if board.mineComment(comment)}
							<button
								type="button"
								onclick={() => remove(comment)}
								class="transition-colors hover:text-error">Delete</button
							>
						{:else if reported.has(comment.id)}
							<span>Thanks, it's reported.</span>
						{:else if !comment.team && canWrite}
							<button
								type="button"
								onclick={() => report(comment)}
								class="transition-colors hover:text-error">Report</button
							>
						{/if}
					</div>
				</li>
			{/each}
		</ol>
	{/if}

	{#if canWrite}
		<form onsubmit={send} class="grid gap-3">
			<Label.Root for="comment-body" class="text-label-large">Add a comment</Label.Root>
			<textarea
				id="comment-body"
				bind:value={draft}
				maxlength="1000"
				rows="3"
				class="field resize-y"></textarea>
			<Button type="submit" class="justify-self-start" disabled={!draft.trim() || sending}
				>Comment</Button
			>
		</form>
	{/if}
	{#if error}<p class="text-body-medium text-error" role="alert">{error}</p>{/if}
</section>
