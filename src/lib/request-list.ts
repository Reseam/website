import type { AppInfo, PatchRequest } from '#lib/types.ts';

export type RequestSort = 'top' | 'new' | 'priority';

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
const rank = (request: PatchRequest) => (request.priority ? PRIORITY_RANK[request.priority] : 3);

export function matchingRequests(
	requests: PatchRequest[],
	query: string,
	status: string,
	sort: RequestSort
) {
	const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
	const text = (request: PatchRequest) =>
		`${request.title} ${request.body ?? ''}`.toLocaleLowerCase();
	return requests
		.filter((request) => !status || request.status === status)
		.filter((request) => words.every((word) => text(request).includes(word)))
		.toSorted(
			(a, b) =>
				(sort === 'priority' ? rank(a) - rank(b) : 0) ||
				(sort === 'new' ? 0 : b.votes - a.votes) ||
				b.created_at.localeCompare(a.created_at)
		);
}

export function requestApps(requests: PatchRequest[], names: Record<string, AppInfo>) {
	return [...Map.groupBy(requests, (request) => request.app)]
		.map(([id, list]) => ({ id, count: list.length, info: id ? names[id] : undefined }))
		.toSorted((a, b) => (a.id === null ? 1 : b.id === null ? -1 : b.count - a.count));
}
