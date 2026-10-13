import { SITE_URL } from './site.ts';

const MANAGER_PACKAGE = 'app.reseam.manager';

export type SourceLink = { url: string; host: string };

export function sourceLink(value: string | null): SourceLink | null {
	if (!value) return null;
	const url = URL.parse(value);
	return url && (url.protocol === 'https:' || url.protocol === 'http:')
		? { url: url.href, host: url.host }
		: null;
}

/** The link authors share: it opens Reseam Manager where installed and this page everywhere else. */
export function addSourceLink(indexUrl: string): string {
	return `${SITE_URL}/add/?url=${encodeURIComponent(indexUrl)}`;
}

/** Hands the link to Reseam Manager from a browser that kept it, falling back to the download page. */
export function managerIntent(indexUrl: string): string {
	const target = new URL(addSourceLink(indexUrl));
	const fallback = encodeURIComponent(`${SITE_URL}/download/`);
	return `intent://${target.host}${target.pathname}${target.search}#Intent;scheme=https;package=${MANAGER_PACKAGE};S.browser_fallback_url=${fallback};end`;
}
