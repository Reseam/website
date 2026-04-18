import raw from './generated/docs.json';
import type { DocsIndex, DocPage } from './types.ts';

export const docs = raw as DocsIndex;

export function findPage(slug: string): DocPage | undefined {
	return docs.pages.find((p) => p.slug === slug);
}

export function neighbours(slug: string): { prev?: DocPage; next?: DocPage } {
	const i = docs.pages.findIndex((p) => p.slug === slug);
	if (i === -1) return {};
	return { prev: docs.pages[i - 1], next: docs.pages[i + 1] };
}
