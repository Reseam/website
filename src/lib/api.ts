import type { Announcement, AppInfo, ReleaseResponse } from '#lib/types.ts';

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

const MAX_APPS_PER_QUESTION = 100;

export async function fetchApps(downloaderUrl: string, packages: string[], fetcher: Fetch = fetch) {
	const chunks = Array.from(
		{ length: Math.ceil(packages.length / MAX_APPS_PER_QUESTION) },
		(_, i) => packages.slice(i * MAX_APPS_PER_QUESTION, (i + 1) * MAX_APPS_PER_QUESTION)
	);
	const answers = await Promise.all(
		chunks.map(async (chunk) => {
			const response = await fetcher(`${downloaderUrl}/query`, {
				method: 'POST',
				headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
				body: JSON.stringify({ source: 'default', op: 'apps', packages: chunk, relay: false }),
			});
			if (!response.ok) throw new Error(`${downloaderUrl}/query returned ${response.status}`);
			const reply: { data: { apps: Record<string, AppInfo> } } = await response.json();
			return reply.data.apps;
		})
	);
	return Object.assign({}, ...answers) as Record<string, AppInfo>;
}

async function fetchJson<T>(url: string, fetcher: Fetch): Promise<T> {
	const response = await fetcher(url, { headers: { Accept: 'application/json' } });
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	return response.json();
}
