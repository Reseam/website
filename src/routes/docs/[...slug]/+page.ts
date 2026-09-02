import { error } from '@sveltejs/kit';
import { docs } from '$lib/docs';

export const prerender = docs.pages.length > 0;

export function entries() {
	return docs.pages.map((p) => ({ slug: p.slug }));
}

export function load({ params }: { params: { slug: string } }) {
	const slug = params.slug.replace(/\/$/, '');
	const i = docs.pages.findIndex((p) => p.slug === slug);
	if (i === -1) error(404, 'Doc not found');
	return { page: docs.pages[i], prev: docs.pages[i - 1], next: docs.pages[i + 1] };
}
