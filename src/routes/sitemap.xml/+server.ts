import { fetchAnnouncements } from '$lib/api';
import { DEFAULT_API_URL } from '$lib/settings.svelte';

export const prerender = true;

const staticPages = ['/', '/download/', '/docs/', '/announcements/'];

export async function GET() {
	const today = new Date().toISOString().slice(0, 10);

	const announcementPages = (await fetchAnnouncements(DEFAULT_API_URL)).map((a) => ({
		path: `/announcements/${a.id}/`,
		lastmod: a.created_at.slice(0, 10),
	}));

	const urls = [...staticPages.map((path) => ({ path, lastmod: today })), ...announcementPages]
		.map(
			({ path, lastmod }) =>
				`  <url><loc>https://reseam.app${path}</loc><lastmod>${lastmod}</lastmod></url>`
		)
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
}
