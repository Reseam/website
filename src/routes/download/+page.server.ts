import { FORGE_API, FORGE_BASE } from '$lib/docs/sources';
import type { PageServerLoad } from './$types';

type CliRelease = {
	tag_name: string;
	published_at: string;
	html_url: string;
	assets: { name: string }[];
};

// Prerendered with the static site: Forgejo doesn't allow cross-origin browser requests.
export const load: PageServerLoad = async ({ fetch }) => {
	const response = await fetch(`${FORGE_API}/repos/reseam/reseam/releases/latest`);
	if (!response.ok) throw new Error(`CLI release fetch failed: ${response.status}`);
	const release: CliRelease = await response.json();
	const platforms: Record<string, string> = {
		'reseam-linux-x64': 'Linux x64',
		'reseam-windows-x64.exe': 'Windows x64',
	};
	return {
		cli: {
			version: release.tag_name,
			publishedAt: release.published_at,
			releaseUrl: release.html_url,
			releasesUrl: `${FORGE_BASE}/reseam/reseam/releases`,
			downloads: release.assets
				.filter((asset) => asset.name in platforms)
				.map((asset) => ({
					name: platforms[asset.name],
					url: `https://cdn.reseam.app/engine/${encodeURIComponent(release.tag_name)}/${asset.name}`,
				})),
		},
	};
};
