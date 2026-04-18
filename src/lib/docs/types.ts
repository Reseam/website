export type DocPage = {
	slug: string;
	sourceSlug: string;
	sourceLabel: string;
	section: number | null;
	order: number;
	title: string;
	description?: string;
	html: string;
	editUrl: string;
};

export type DocGroup = {
	slug: string;
	label: string;
	sections: { key: string; label: string; pages: DocPage[] }[];
};

export type DocsIndex = {
	groups: DocGroup[];
	pages: DocPage[];
	hub?: { html: string; title?: string; description?: string };
	generatedAt: string;
};
