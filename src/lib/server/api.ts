import { DOWNLOADER_URL } from '$app/env/public';
import {
	fetchAnnouncements,
	fetchAppsOrNone,
	fetchCommunity,
	fetchManagerIndex,
	fetchPatchesIndex,
	latestStable,
} from '#lib/api.ts';
import { groupByApp, packagesOf } from '#lib/catalog.ts';
import { packagesOfCommunity } from '#lib/community.ts';
import { DEFAULT_API_URL } from '#lib/settings.svelte.ts';

// Prerendering loads every page in one process, so each source is fetched once per build.
const once = <T>(load: () => Promise<T>) => {
	let pending: Promise<T> | undefined;
	return () => (pending ??= load());
};

export const announcements = once(() => fetchAnnouncements(DEFAULT_API_URL));
export const patchesIndex = once(() => fetchPatchesIndex(DEFAULT_API_URL));
export const managerIndex = once(() => fetchManagerIndex(DEFAULT_API_URL));
export const community = once(() => fetchCommunity(DEFAULT_API_URL));
export const patches = once(async () => latestStable(await patchesIndex()));
export const manager = once(async () => latestStable(await managerIndex()));

export const apps = once(async () =>
	fetchAppsOrNone(DOWNLOADER_URL, packagesOf(groupByApp((await patches()).release.patches ?? [])))
);

export const communityApps = once(async () =>
	fetchAppsOrNone(DOWNLOADER_URL, packagesOfCommunity(await community()))
);
