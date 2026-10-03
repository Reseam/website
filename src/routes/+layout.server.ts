import { newestFirst } from '#lib/announcements.ts';
import { announcements } from '#lib/server/api.ts';

export async function load() {
	return { latest: newestFirst(await announcements())[0] ?? null };
}
