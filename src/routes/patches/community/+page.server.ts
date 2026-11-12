import { community, communityApps } from '#lib/server/api.ts';

export async function load() {
	return { bundles: await community(), apps: await communityApps() };
}
