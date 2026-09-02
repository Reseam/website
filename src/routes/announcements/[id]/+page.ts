import { browser } from '$app/environment';
import { error } from '@sveltejs/kit';
import { fetchAnnouncement, fetchAnnouncements } from '$lib/api';
import { DEFAULT_API_URL, settings } from '$lib/settings.svelte';
import type { Announcement } from '$lib/types';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = 'auto';

let buildList: Promise<Announcement[]> | undefined;
const listAtBuild = () => (buildList ??= fetchAnnouncements(DEFAULT_API_URL));

export const entries: EntryGenerator = async () =>
	(await listAtBuild()).map((a) => ({ id: String(a.id) }));

export const load: PageLoad = async ({ params, fetch }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) error(404, 'Announcement not found');

	if (browser) return { announcement: await fetchAnnouncement(settings.apiUrl, id, fetch) };

	const announcement = (await listAtBuild()).find((a) => a.id === id);
	if (!announcement) error(404, 'Announcement not found');
	return { announcement };
};
