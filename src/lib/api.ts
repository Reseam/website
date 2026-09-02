import { error } from '@sveltejs/kit';
import type { Announcement, ReleaseResponse } from '$lib/types';

export function fetchLatestManager(apiUrl: string) {
	return fetchJson<ReleaseResponse>(`${apiUrl}/v1/manager`);
}

export function fetchAnnouncements(apiUrl: string, tag = '') {
	const params = new URLSearchParams({ archived: 'false' });
	if (tag) params.set('tag', tag);
	return fetchJson<Announcement[]>(`${apiUrl}/v1/announcements?${params}`);
}

export function fetchAnnouncement(apiUrl: string, id: number, fetcher = fetch) {
	return fetchJson<Announcement>(`${apiUrl}/v1/announcements/${id}`, fetcher);
}

async function fetchJson<T>(url: string, fetcher = fetch): Promise<T> {
	const response = await fetcher(url, { headers: { Accept: 'application/json' } });
	if (!response.ok) error(response.status, `API returned ${response.status}`);
	return response.json();
}
