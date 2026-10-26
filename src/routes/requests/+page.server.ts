import { groupByApp, packagesOf } from '#lib/catalog.ts';
import { fetchRequests } from '#lib/requests.svelte.ts';
import { apps, patches } from '#lib/server/api.ts';
import { DEFAULT_API_URL } from '#lib/settings.svelte.ts';

export async function load() {
	const [requests, release, names] = await Promise.all([
		fetchRequests(DEFAULT_API_URL),
		patches(),
		apps(),
	]);
	return { requests, packages: packagesOf(groupByApp(release.release.patches ?? [])), apps: names };
}
