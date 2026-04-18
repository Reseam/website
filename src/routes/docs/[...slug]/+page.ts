import { error } from '@sveltejs/kit';
import { docs, findPage, neighbours } from '$lib/docs';

export const prerender = docs.pages.length > 0;

export function entries() {
	return docs.pages.map((p) => ({ slug: p.slug }));
}

export function load({ params }: { params: { slug: string } }) {
	const slug = params.slug.replace(/\/$/, '');
	const page = findPage(slug);
	if (!page) error(404, 'Doc not found');
	return { page, ...neighbours(slug) };
}
