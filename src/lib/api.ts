import type { Announcement, ReleaseResponse } from '$lib/types';

export type ApiResult<T> =
	| { ok: true; data: T }
	| { ok: false; message: string };

export async function fetchLatestPatches(
	apiUrl: string,
	fetcher: typeof fetch = fetch
): Promise<ApiResult<ReleaseResponse>> {
	return fetchJson<ReleaseResponse>(`${apiUrl}/v1/patches`, fetcher);
}

export async function fetchLatestManager(
	apiUrl: string,
	fetcher: typeof fetch = fetch
): Promise<ApiResult<ReleaseResponse>> {
	return fetchJson<ReleaseResponse>(`${apiUrl}/v1/manager`, fetcher);
}

export async function fetchAnnouncements(
	apiUrl: string,
	tag = '',
	fetcher: typeof fetch = fetch
): Promise<ApiResult<Announcement[]>> {
	const params = new URLSearchParams({ archived: 'false' });
	if (tag) params.set('tag', tag);
	return fetchJson<Announcement[]>(`${apiUrl}/v1/announcements?${params}`, fetcher);
}

export async function fetchAnnouncement(
	apiUrl: string,
	id: number,
	fetcher: typeof fetch = fetch
): Promise<ApiResult<Announcement>> {
	return fetchJson<Announcement>(`${apiUrl}/v1/announcements/${id}`, fetcher);
}

async function fetchJson<T>(url: string, fetcher: typeof fetch): Promise<ApiResult<T>> {
	try {
		const response = await fetcher(url, {
			headers: { Accept: 'application/json' }
		});

		if (!response.ok) {
			return {
				ok: false,
				message: `API returned ${response.status} ${response.statusText || 'error'}`
			};
		}

		return { ok: true, data: (await response.json()) as T };
	} catch (error) {
		return {
			ok: false,
			message: error instanceof Error ? error.message : 'Unable to reach API'
		};
	}
}
