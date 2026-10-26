import { browser } from '$app/env';
import { fetchAnnouncements } from '#lib/api.ts';
import { newestFirst } from '#lib/announcements.ts';
import { buildCache } from '#lib/build-cache.ts';
import { DEFAULT_API_URL, settings } from '#lib/settings.svelte.ts';

export const prerender = true;
export const trailingSlash = 'always';

const announcements = buildCache(fetchAnnouncements);

// Universal, so a page added after the build (a new release) still renders from the static fallback.
export async function load({ fetch }) {
	const list = await announcements(browser ? settings.apiUrl : DEFAULT_API_URL, fetch);
	return { latest: newestFirst(list)[0] ?? null };
}
