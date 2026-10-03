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
		slug: 'authoring',
		repo: 'reseam/reseam',
		label: 'Writing patches',
		summary: 'Start from the template, write patches in Kotlin, and publish a signed bundle.',
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
		label: 'API server',
		summary: 'Run your own instance of the server behind api.reseam.app.',
		path: 'docs',
		branch: 'main',
	},
];
