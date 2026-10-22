import { DOWNLOADER_URL } from '$app/env/public';
import { fetchApps } from '#lib/api.ts';
import type { AppInfo } from '#lib/types.ts';

/**
 * Names from the build, with apps a newer release added asked for in the browser.
 * Each app is asked once per visit, named or not.
 */
export function appNames(built: () => Record<string, AppInfo>, packages: () => string[]) {
	let found = $state.raw<Record<string, AppInfo>>({});
	const asked = new Set<string>();

	$effect(() => {
		const known = built();
		const missing = packages().filter((app) => !(app in known) && !asked.has(app));
		if (missing.length === 0) return;
		for (const app of missing) asked.add(app);
		fetchApps(DOWNLOADER_URL, missing).then(
			(named) => (found = { ...found, ...named }),
			() => {}
		);
	});

	return {
		get value() {
			return { ...built(), ...found };
		},
	};
}
