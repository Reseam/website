import { error } from '@sveltejs/kit';
import { docs } from '#lib/server/docs.ts';

export function entries() {
	return docs.pages.map(({ slug }) => ({ slug }));
}

export function load({ params }) {
	const index = docs.pages.findIndex(({ slug }) => slug === params.slug.replace(/\/$/, ''));
	if (index === -1) error(404, 'Page not found');
	const link = (offset: number) => {
		const page = docs.pages[index + offset];
		return page && { slug: page.slug, title: page.title };
	};
	return { page: docs.pages[index], previous: link(-1), next: link(1) };
}
