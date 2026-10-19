import { FORGE_API, FORGE_BASE } from '#lib/docs/sources.ts';
import { manager } from '#lib/server/api.ts';

type Release = { tag_name: string; published_at: string };

const CLI_BUILDS: Record<string, string> = {
	'reseam-linux-x64': 'Linux',
	'reseam-windows-x64.exe': 'Windows',
};

// Prerendered: Forgejo does not allow cross-origin requests from browsers.
export async function load({ fetch }) {
	const latest = async (repo: string): Promise<Release> => {
		const response = await fetch(`${FORGE_API}/repos/reseam/${repo}/releases/latest`);
		if (!response.ok) throw new Error(`${repo} release lookup returned ${response.status}`);
		return response.json();
	};
	const [cli, gmscore] = await Promise.all([latest('reseam'), latest('gmscore')]);
	const gmscoreVersion = gmscore.tag_name.replace(/^v/, '');
	const gmscoreFile = (name: string) =>
		`https://cdn.reseam.app/gmscore/${encodeURIComponent(gmscore.tag_name)}/${name}`;
	return {
		manager: await manager(),
		cli: {
			version: cli.tag_name.replace(/^v/, ''),
			publishedAt: cli.published_at,
			releasesUrl: `${FORGE_BASE}/reseam/reseam/releases`,
			builds: Object.entries(CLI_BUILDS).map(([name, platform]) => ({
				platform,
				url: `https://cdn.reseam.app/engine/${encodeURIComponent(cli.tag_name)}/${name}`,
			})),
		},
		// File names as the GmsCore release workflow uploads them.
		gmscore: {
			version: gmscoreVersion,
			publishedAt: gmscore.published_at,
			builds: [
				{
					title: 'Android',
					detail: 'Most phones',
					url: gmscoreFile(`reseam-gmscore-${gmscoreVersion}.apk`),
				},
				{
					title: 'Huawei',
					detail: 'Huawei phones',
					url: gmscoreFile(`reseam-gmscore-${gmscoreVersion}-huawei.apk`),
				},
			],
		},
	};
}
