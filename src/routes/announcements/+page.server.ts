import { newestFirst } from '#lib/announcements.ts';
import { announcements } from '#lib/server/api.ts';

export async function load() {
	return { announcements: newestFirst(await announcements()) };
}
