import { fetchAnnouncements, fetchLatestPatches, fetchManager } from '#lib/api.ts';
import { DEFAULT_API_URL } from '#lib/settings.svelte.ts';

// Prerendering loads every page in one process, so each source is fetched once per build.
const once = <T>(load: () => Promise<T>) => {
	let pending: Promise<T> | undefined;
	return () => (pending ??= load());
};

export const announcements = once(() => fetchAnnouncements(DEFAULT_API_URL));
export const patches = once(() => fetchLatestPatches(DEFAULT_API_URL));
export const manager = once(() => fetchManager(DEFAULT_API_URL));
