import { FORGE_API, FORGE_BASE } from '#lib/docs/sources.ts';
import { manager } from '#lib/server/api.ts';

type CliRelease = { tag_name: string; published_at: string; assets: { name: string }[] };

const CLI_BUILDS: Record<string, string> = {
	'reseam-linux-x64': 'Linux',
	'reseam-windows-x64.exe': 'Windows',
};

// Prerendered: Forgejo does not allow cross-origin requests from browsers.
export async function load({ fetch }) {
	const response = await fetch(`${FORGE_API}/repos/reseam/reseam/releases/latest`);
	if (!response.ok) throw new Error(`CLI release lookup returned ${response.status}`);
	const release: CliRelease = await response.json();
	return {
		manager: await manager(),
		cli: {
			version: release.tag_name.replace(/^v/, ''),
			publishedAt: release.published_at,
			releasesUrl: `${FORGE_BASE}/reseam/reseam/releases`,
			builds: release.assets
				.filter((asset) => asset.name in CLI_BUILDS)
				.map((asset) => ({
					platform: CLI_BUILDS[asset.name],
					url: `https://cdn.reseam.app/engine/${encodeURIComponent(release.tag_name)}/${asset.name}`,
				})),
		},
	};
}
