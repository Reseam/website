import { m } from '#lib/paraglide/messages.js';
import { getLocale, localizeHref } from '#lib/paraglide/runtime.js';
import type { AppInfo, CommunityBundle } from '#lib/types.ts';

const NAMED_APPS = 3;

export function communityPath(slug: string) {
	return localizeHref(`/patches/community/${slug}/`);
}

export function packagesOfCommunity(bundles: CommunityBundle[]) {
	return [...new Set(bundles.flatMap((bundle) => bundle.apps))];
}

export function matchesBundle(
	bundle: CommunityBundle,
	query: string,
	names: Record<string, AppInfo>
) {
	const locale = getLocale();
	const needle = query.trim().toLocaleLowerCase(locale);
	const apps = bundle.apps.map((app) => names[app]?.name ?? app);
	return (
		!needle ||
		[bundle.name, bundle.author, bundle.description, ...apps]
			.join(' ')
			.toLocaleLowerCase(locale)
			.includes(needle)
	);
}

/** `null` is the app filter's "any app" entry: sources with a patch for every app. */
export function patchesApp(bundle: CommunityBundle, app: string | null) {
	return app === null ? bundle.any_app : bundle.apps.includes(app);
}

export function appsText(bundle: CommunityBundle, names: Record<string, AppInfo>) {
	const labels = [
		...bundle.apps.map((app) => names[app]?.name ?? app),
		...(bundle.any_app ? [m.catalog_any_app()] : []),
	];
	if (labels.length <= NAMED_APPS)
		return new Intl.ListFormat(getLocale(), { type: 'conjunction' }).format(labels);
	const list = new Intl.ListFormat(getLocale(), { type: 'unit', style: 'short' }).format(
		labels.slice(0, NAMED_APPS)
	);
	return m.community_apps_more({ list, count: labels.length - NAMED_APPS });
}

/** The start of a signing key in groups of four, as Reseam Manager shows it. */
export function fingerprint(key: string) {
	return key
		.slice(0, 16)
		.match(/.{1,4}/g)!
		.join(' ');
}
