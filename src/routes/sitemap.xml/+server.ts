import { fetchAnnouncements } from '$lib/api';
import { DEFAULT_API_URL } from '$lib/api-url';

export const prerender = true;

const staticPages = ['/', '/download/', '/docs/', '/announcements/'];

export async function GET() {
	const today = new Date().toISOString().slice(0, 10);

	const result = await fetchAnnouncements(DEFAULT_API_URL);
	const announcementPaths = result.ok ? result.data.map((a) => `/announcements/${a.id}/`) : [];

	const urls = [...staticPages, ...announcementPaths]
		.map((path) => `  <url><loc>https://reseam.app${path}</loc><lastmod>${today}</lastmod></url>`)
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
