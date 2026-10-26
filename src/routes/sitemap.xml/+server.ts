import { docs } from '#lib/server/docs.ts';
import { announcements, managerIndex, patchesIndex } from '#lib/server/api.ts';
import { entryPath, updateEntries } from '#lib/updates.ts';
import { SITE_URL } from '#lib/site.ts';

export const prerender = true;

const PAGES = [
	'/',
	'/patches/',
	'/patch/',
	'/download/',
	'/docs/',
	'/updates/',
	'/requests/',
	'/donate/',
];

export async function GET() {
	const today = new Date().toISOString().slice(0, 10);
	const urls = [
		...PAGES.map((path) => ({ path, lastmod: today })),
		...docs.pages.map(({ slug }) => ({ path: `/docs/${slug}/`, lastmod: today })),
		...updateEntries(await patchesIndex(), await managerIndex(), await announcements()).map(
			(entry) => ({ path: entryPath(entry), lastmod: entry.date.slice(0, 10) })
		),
	];
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ path, lastmod }) => `\t<url><loc>${SITE_URL}${path}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}
</urlset>`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
