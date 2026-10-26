import { fetchJson } from '#lib/api.ts';
import type { PatchRequest, RequestComment, RequestStatus } from '#lib/types.ts';

const VOTER_KEY = 'reseam.voter';
const SEEN_KEY = 'reseam.seenRequests';
const SEEN_COMMENTS_KEY = 'reseam.seenComments';

export const STATUSES: Record<Exclude<RequestStatus, 'hidden'>, string> = {
	open: 'Open',
	planned: 'Planned',
	shipped: 'Shipped',
	declined: 'Declined',
	duplicate: 'Duplicate',
};

export type RequestQuery = {
	app?: string;
	status?: RequestStatus;
	sort?: 'top' | 'new';
	q?: string;
};
export type RequestDraft = { app?: string; title: string; body?: string; force?: boolean };
export type Activity = { requests: number[]; votes: number[]; comments: number[] };

export class RequestError extends Error {
	constructor(
		readonly status: number,
		message: string,
		readonly duplicate?: PatchRequest
	) {
		super(message);
	}
}

export function fetchRequests(
	apiUrl: string,
	query: RequestQuery = {},
	fetcher: typeof fetch = fetch
) {
	const params = new URLSearchParams(
		Object.entries(query).filter((entry): entry is [string, string] => !!entry[1])
	);
	return fetchJson<PatchRequest[]>(`${apiUrl}/v1/requests?${params}`, fetcher);
}

export function fetchComments(apiUrl: string, id: number) {
	return fetchJson<RequestComment[]>(`${apiUrl}/v1/requests/${id}/comments`, fetch);
}

/** "patches@0.48.0" as the Updates entry it shipped in. */
export function shippedEntry(shippedIn: string) {
	const [kind, version] = shippedIn.split('@');
	if (!version || (kind !== 'patches' && kind !== 'manager')) return undefined;
	return {
		label: `${kind === 'patches' ? 'Reseam Patches' : 'Reseam Manager'} ${version}`,
		href: `/updates/${kind}/${version}/`,
	};
}

/**
 * The anonymous voter this browser holds for one API server. A server that no longer knows the token
 * answers 401, which drops it so the next action asks for a new one.
 */
export function voterFor(apiUrl: string) {
	const key = `${VOTER_KEY}:${apiUrl}`;
	let token = $state(read(key));

	async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
		const response = await fetch(`${apiUrl}${path}`, {
			...init,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				...(token && { Authorization: `Bearer ${token}` }),
			},
		});
		const body = response.status === 204 ? undefined : await response.json();
		if (response.status === 401) forget();
		if (!response.ok)
			throw new RequestError(response.status, body?.error ?? `${response.status}`, body?.duplicate);
		return body as T;
	}

	function forget() {
		token = null;
		write(key, null);
	}

	return {
		get ready() {
			return token !== null;
		},
		async verify(turnstile: string) {
			const { token: issued } = await call<{ token: string }>('/v1/voters', {
				method: 'POST',
				body: JSON.stringify({ turnstile }),
			});
			token = issued;
			write(key, issued);
		},
		activity: () => call<Activity>('/v1/voters/me'),
		submit: (draft: RequestDraft) =>
			call<PatchRequest>('/v1/requests', { method: 'POST', body: JSON.stringify(draft) }),
		vote: (id: number, on: boolean) =>
			call<{ votes: number }>(`/v1/requests/${id}/vote`, { method: on ? 'PUT' : 'DELETE' }),
		report: (id: number) => call<{ ok: boolean }>(`/v1/requests/${id}/report`, { method: 'POST' }),
		comment: (id: number, body: string) =>
			call<RequestComment>(`/v1/requests/${id}/comments`, {
				method: 'POST',
				body: JSON.stringify({ body }),
			}),
		reportComment: (id: number) =>
			call<{ ok: boolean }>(`/v1/comments/${id}/report`, { method: 'POST' }),
		deleteComment: (id: number) =>
			call<{ ok: boolean }>(`/v1/comments/${id}`, { method: 'DELETE' }),
	};
}

export type Voter = ReturnType<typeof voterFor>;

export function unseenChanges(mine: PatchRequest[]) {
	const seen: Record<string, RequestStatus> = JSON.parse(read(SEEN_KEY) ?? '{}');
	const changed = mine.filter(
		(request) => request.status !== 'open' && seen[request.id] !== request.status
	);
	return {
		changed,
		markSeen() {
			write(
				SEEN_KEY,
				JSON.stringify(Object.fromEntries(mine.map((request) => [request.id, request.status])))
			);
		},
	};
}

/** Your requests with comments you haven't seen, counted from the last time this browser showed them. */
export function unseenComments(mine: PatchRequest[]) {
	const seen: Record<string, number> = JSON.parse(read(SEEN_COMMENTS_KEY) ?? '{}');
	return {
		commented: mine.filter((request) => request.comments > (seen[request.id] ?? 0)),
		markSeen() {
			write(
				SEEN_COMMENTS_KEY,
				JSON.stringify(Object.fromEntries(mine.map((request) => [request.id, request.comments])))
			);
		},
	};
}

export function markCommentsSeen(request: PatchRequest) {
	const seen: Record<string, number> = JSON.parse(read(SEEN_COMMENTS_KEY) ?? '{}');
	write(SEEN_COMMENTS_KEY, JSON.stringify({ ...seen, [request.id]: request.comments }));
}

function read(key: string) {
	return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
}

function write(key: string, value: string | null) {
	if (value === null) localStorage.removeItem(key);
	else localStorage.setItem(key, value);
}
