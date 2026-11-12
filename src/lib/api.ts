import type { ReleaseIndex } from '@reseam/browser';
import type {
	Announcement,
	AppInfo,
	CommunityBundle,
	CommunityDetail,
	ReleaseResponse,
} from '#lib/types.ts';

type Fetch = typeof fetch;

export function fetchPatchesIndex(apiUrl: string, fetcher: Fetch = fetch) {
	return fetchJson<ReleaseIndex>(`${apiUrl}/patches.json`, fetcher);
}

export function fetchManagerIndex(apiUrl: string, fetcher: Fetch = fetch) {
	return fetchJson<ReleaseIndex>(`${apiUrl}/manager.json`, fetcher);
}

/** The newest stable release; `reseam release` writes an index newest first. */
export function latestStable(index: ReleaseIndex): ReleaseResponse {
	const release = index.releases.find((release) => !release.prerelease);
	if (!release) throw new Error(`${index.bundle.name} has no stable release`);
	return { bundle: index.bundle, release };
}

export async function fetchManager(apiUrl: string, fetcher: Fetch = fetch) {
	return latestStable(await fetchManagerIndex(apiUrl, fetcher));
}

export async function fetchLatestPatches(apiUrl: string, fetcher: Fetch = fetch) {
	return latestStable(await fetchPatchesIndex(apiUrl, fetcher));
}

export function fetchAnnouncements(apiUrl: string, fetcher: Fetch = fetch) {
	return fetchJson<Announcement[]>(`${apiUrl}/v1/announcements`, fetcher);
}

/** Bundles taken off the list stay in the API's answer so apps can warn people who added them; the site leaves them out. */
export async function fetchCommunity(apiUrl: string, fetcher: Fetch = fetch) {
	const bundles = await fetchJson<CommunityBundle[]>(`${apiUrl}/v1/community`, fetcher);
	return bundles.filter((bundle) => bundle.listed);
}

export async function fetchCommunityBundle(
	apiUrl: string,
	slug: string,
	fetcher: Fetch = fetch
): Promise<CommunityDetail | null> {
	const url = `${apiUrl}/v1/community/${encodeURIComponent(slug)}`;
	const response = await fetcher(url, { headers: { Accept: 'application/json' } });
	if (response.status === 404) return null;
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	return response.json();
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

/** Names are a nicety: without the downloader a build shows package names and visitors' browsers ask again. */
export async function fetchAppsOrNone(
	downloaderUrl: string,
	packages: string[],
	fetcher: Fetch = fetch
) {
	try {
		return await fetchApps(downloaderUrl, packages, fetcher);
	} catch (error) {
		console.warn(`Building without app names: ${error}`);
		return {};
	}
}

export async function fetchJson<T>(url: string, fetcher: Fetch): Promise<T> {
	const response = await fetcher(url, { headers: { Accept: 'application/json' } });
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	return response.json();
}
