import { SvelteSet } from 'svelte/reactivity';
import { markCommentsSeen, type Activity, type Voter } from '#lib/requests.svelte.ts';
import type { PatchRequest, RequestComment } from '#lib/types.ts';

/**
 * The requests on the page and this browser's part in them. Votes show at once and roll back when the
 * API refuses them; an action that needs a voter waits for the Turnstile check, then runs.
 */
export class RequestBoard {
	#pending: (() => void) | undefined;
	readonly voter: Voter;
	readonly reported = new SvelteSet<number>();
	activity = $state.raw<Activity>({ requests: [], votes: [], comments: [] });
	verifying = $state(false);
	requests: PatchRequest[];

	constructor(source: () => PatchRequest[], voter: Voter) {
		this.requests = $derived(source());
		this.voter = voter;
	}

	loadActivity() {
		if (this.voter.ready)
			this.voter.activity().then(
				(found) => (this.activity = found),
				() => {}
			);
	}

	voted(request: PatchRequest) {
		return this.activity.votes.includes(request.id);
	}

	mine() {
		return this.requests.filter((request) => this.activity.requests.includes(request.id));
	}

	async verified(turnstile: string) {
		await this.voter.verify(turnstile);
		this.activity = await this.voter.activity();
		this.#pending?.();
		this.#pending = undefined;
	}

	vote(request: PatchRequest) {
		this.withVoter(async () => {
			const on = !this.voted(request);
			const before = { votes: request.votes, ids: this.activity.votes };
			this.#setVotes(
				request,
				request.votes + (on ? 1 : -1),
				on ? [...before.ids, request.id] : before.ids.filter((id) => id !== request.id)
			);
			try {
				this.#setVotes(request, (await this.voter.vote(request.id, on)).votes, this.activity.votes);
			} catch {
				this.#setVotes(request, before.votes, before.ids);
			}
		});
	}

	report(request: PatchRequest) {
		this.withVoter(async () => {
			await this.voter.report(request.id);
			this.reported.add(request.id);
		});
	}

	replace(request: PatchRequest) {
		this.requests = this.requests.map((r) => (r.id === request.id ? request : r));
	}

	remove(id: number) {
		this.requests = this.requests.filter((r) => r.id !== id);
	}

	posted(request: PatchRequest) {
		this.requests = [request, ...this.requests];
		this.activity = { ...this.activity, requests: [...this.activity.requests, request.id] };
	}

	mineComment(comment: RequestComment) {
		return this.activity.comments.includes(comment.id);
	}

	/** Counts a comment this browser posted or deleted, so your own comments never show as new to you. */
	commented(comment: RequestComment, change: 1 | -1) {
		const visible = comment.hidden ? 0 : change;
		this.requests = this.requests.map((r) =>
			r.id === comment.request_id ? { ...r, comments: r.comments + visible } : r
		);
		this.activity = {
			...this.activity,
			comments:
				change === 1
					? [...this.activity.comments, comment.id]
					: this.activity.comments.filter((id) => id !== comment.id),
		};
		const request = this.requests.find((r) => r.id === comment.request_id);
		if (request && this.activity.requests.includes(request.id)) markCommentsSeen(request);
	}

	withVoter(action: () => void) {
		if (this.voter.ready) return action();
		this.#pending = action;
		this.verifying = true;
	}

	#setVotes(request: PatchRequest, votes: number, ids: number[]) {
		this.requests = this.requests.map((r) => (r.id === request.id ? { ...r, votes } : r));
		this.activity = { ...this.activity, votes: ids };
	}
}
