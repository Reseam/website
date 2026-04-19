export const FORGE_BASE = 'https://git.reseam.app';
export const FORGE_API = `${FORGE_BASE}/api/v1`;

export type DocSource = {
	slug: string;
	repo: string;
	label: string;
	branch?: string;
	path?: string;
	hub?: boolean;
};

export const sources: DocSource[] = [
	{ slug: 'website', repo: 'reseam/website', label: 'Website', hub: true },
	{ slug: 'engine', repo: 'reseam/reseam', label: 'Engine', path: 'crates/cli/docs' },
	{ slug: 'api', repo: 'reseam/api', label: 'API' },
	{ slug: 'patches', repo: 'reseam/patches', label: 'Patches' },
];
