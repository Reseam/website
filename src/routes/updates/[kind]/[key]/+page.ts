import { error } from '@sveltejs/kit';
import { browser } from '$app/env';
import { buildCache } from '#lib/build-cache.ts';
import { DEFAULT_API_URL, settings } from '#lib/settings.svelte.ts';
import { loadUpdates } from '#lib/updates.ts';

const updates = buildCache(loadUpdates);

export async function entries() {
	return (await updates(DEFAULT_API_URL, fetch)).map(({ kind, key }) => ({ kind, key }));
}

// Universal, so a release published after the build renders in the browser from the static fallback.
export async function load({ params, fetch }) {
	const list = await updates(browser ? settings.apiUrl : DEFAULT_API_URL, fetch);
	const index = list.findIndex((entry) => entry.kind === params.kind && entry.key === params.key);
	if (index === -1) error(404, 'Update not found');
	return { entry: list[index], newer: list[index - 1] ?? null, older: list[index + 1] ?? null };
}
