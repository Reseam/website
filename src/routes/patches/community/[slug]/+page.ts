import { error } from '@sveltejs/kit';
import { browser, building } from '$app/env';
import { DOWNLOADER_URL } from '$app/env/public';
import { fetchAppsOrNone, fetchCommunity, fetchCommunityBundle } from '#lib/api.ts';
import { buildCache } from '#lib/build-cache.ts';
import { DEFAULT_API_URL, settings } from '#lib/settings.svelte.ts';

const community = buildCache(fetchCommunity);

export async function entries() {
	return (await community(DEFAULT_API_URL, fetch)).map(({ slug }) => ({ slug }));
}

// Universal, so a bundle listed after the build renders in the browser from the static fallback.
export async function load({ params, fetch }) {
	const apiUrl = browser ? settings.apiUrl : DEFAULT_API_URL;
	const bundle = await fetchCommunityBundle(apiUrl, params.slug, fetch);
	if (!bundle) error(404, 'Community patch source not found');
	return {
		bundle,
		apps: building ? await fetchAppsOrNone(DOWNLOADER_URL, bundle.apps, fetch) : {},
	};
}
