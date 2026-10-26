import { building } from '$app/env';

/**
 * Prerendering loads every page in one process, so each source is fetched once per build and API server.
 * In the browser every load asks again, so navigation shows current data.
 */
export function buildCache<T>(load: (apiUrl: string, fetcher: typeof fetch) => Promise<T>) {
	const cache = new Map<string, Promise<T>>();
	return (apiUrl: string, fetcher: typeof fetch) => {
		if (!building) return load(apiUrl, fetcher);
		if (!cache.has(apiUrl)) cache.set(apiUrl, load(apiUrl, fetcher));
		return cache.get(apiUrl)!;
	};
}
