import type { Announcement, ReleaseResponse } from '#lib/types.ts';

type Fetch = typeof fetch;

export function fetchManager(apiUrl: string, fetcher: Fetch = fetch) {
	return fetchJson<ReleaseResponse>(`${apiUrl}/v1/manager`, fetcher);
}

export function fetchLatestPatches(apiUrl: string, fetcher: Fetch = fetch) {
	return fetchJson<ReleaseResponse>(`${apiUrl}/v1/patches`, fetcher);
}

export function fetchAnnouncements(apiUrl: string, fetcher: Fetch = fetch) {
	return fetchJson<Announcement[]>(`${apiUrl}/v1/announcements?archived=false`, fetcher);
}

async function fetchJson<T>(url: string, fetcher: Fetch): Promise<T> {
	const response = await fetcher(url, { headers: { Accept: 'application/json' } });
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	return response.json();
}
