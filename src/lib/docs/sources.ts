export const FORGE_BASE = 'https://git.reseam.app';
export const FORGE_API = `${FORGE_BASE}/api/v1`;

export type DocSource = {
	slug: string;
	repo: string;
	label: string;
	summary: string;
	path: string;
	branch: string;
};

export const sources: DocSource[] = [
	{
		slug: 'engine',
		repo: 'reseam/reseam',
		label: 'Engine',
		summary: 'Write patches in Kotlin, build them into a signed bundle, and publish it.',
		path: 'docs',
		branch: 'main',
	},
	{
		slug: 'cli',
		repo: 'reseam/reseam',
		label: 'CLI',
		summary: 'Patch APKs, build bundles, and publish them from a terminal.',
		path: 'crates/cli/docs',
		branch: 'main',
	},
	{
		slug: 'api',
		repo: 'reseam/api',
		label: 'API',
		summary:
			'The server behind api.reseam.app: the patch index, release downloads, and announcements.',
		path: 'docs',
		branch: 'main',
	},
];
