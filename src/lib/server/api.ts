import { DOWNLOADER_URL } from '$app/env/public';
import {
	fetchAnnouncements,
	fetchApps,
	fetchManagerIndex,
	fetchPatchesIndex,
	latestStable,
} from '#lib/api.ts';
import { groupByApp, packagesOf } from '#lib/catalog.ts';
import { DEFAULT_API_URL } from '#lib/settings.svelte.ts';

// Prerendering loads every page in one process, so each source is fetched once per build.
const once = <T>(load: () => Promise<T>) => {
	let pending: Promise<T> | undefined;
	return () => (pending ??= load());
};

export const announcements = once(() => fetchAnnouncements(DEFAULT_API_URL));
export const patchesIndex = once(() => fetchPatchesIndex(DEFAULT_API_URL));
export const managerIndex = once(() => fetchManagerIndex(DEFAULT_API_URL));
export const patches = once(async () => latestStable(await patchesIndex()));
export const manager = once(async () => latestStable(await managerIndex()));

/** Names are a nicety: without the downloader the build shows package names and visitors' browsers ask again. */
export const apps = once(async () => {
	const packages = packagesOf(groupByApp((await patches()).release.patches ?? []));
	try {
		return await fetchApps(DOWNLOADER_URL, packages);
	} catch (error) {
		console.warn(`Building without app names: ${error}`);
		return {};
	}
});
