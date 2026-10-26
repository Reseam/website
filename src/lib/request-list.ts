import type { AppInfo, PatchRequest } from '#lib/types.ts';

export type RequestSort = 'top' | 'new';

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
		.toSorted((a, b) =>
			sort === 'top' && a.votes !== b.votes
				? b.votes - a.votes
				: b.created_at.localeCompare(a.created_at)
		);
}

export function requestApps(requests: PatchRequest[], names: Record<string, AppInfo>) {
	return [...Map.groupBy(requests, (request) => request.app)]
		.map(([id, list]) => ({ id, count: list.length, info: id ? names[id] : undefined }))
		.toSorted((a, b) => (a.id === null ? 1 : b.id === null ? -1 : b.count - a.count));
}
