import { error } from '@sveltejs/kit';
import { announcements } from '#lib/server/api.ts';

export async function entries() {
	return (await announcements()).map(({ id }) => ({ id: String(id) }));
}

export async function load({ params }) {
	const announcement = (await announcements()).find(({ id }) => String(id) === params.id);
	if (!announcement) error(404, 'Announcement not found');
	return { announcement };
}
