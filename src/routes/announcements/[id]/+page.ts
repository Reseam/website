import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import { fetchAnnouncement, fetchAnnouncements } from '$lib/api';
import { DEFAULT_API_URL } from '$lib/api-url';
import { api } from '$lib/stores/api.svelte';
import { settings } from '$lib/stores/settings.svelte';
import type { Announcement } from '$lib/types';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = 'auto';
export const trailingSlash = 'always';

let buildListPromise: Promise<Announcement[]> | null = null;

function loadBuildList(): Promise<Announcement[]> {
	if (!buildListPromise) {
		buildListPromise = fetchAnnouncements(DEFAULT_API_URL).then((result) =>
			result.ok ? result.data : []
		);
	}
	return buildListPromise;
}

export const entries: EntryGenerator = async () => {
	const list = await loadBuildList();
	return list.map((a) => ({ id: String(a.id) }));
};

export const load: PageLoad = async ({ params, fetch }) => {
	const id = Number(params.id);
	if (!Number.isFinite(id) || id <= 0) error(404, 'Announcement not found');

	if (!browser) {
		const list = await loadBuildList();
		const found = list.find((a) => a.id === id);
		if (!found) error(404, 'Announcement not found');
		return { announcement: found };
	}

	const cached = api.announcements.data?.find((a) => a.id === id);
	if (cached) return { announcement: cached };

	const result = await fetchAnnouncement(settings.apiUrl, id, fetch);
	if (!result.ok) error(404, result.message);
	return { announcement: result.data };
};
