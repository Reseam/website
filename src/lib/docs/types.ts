export type DocHeading = { id: string; text: string; level: number };

export type DocPage = {
	slug: string;
	source: string;
	section: string;
	title: string;
	description?: string;
	html: string;
	headings: DocHeading[];
	editUrl: string;
};

export type DocLink = Pick<DocPage, 'slug' | 'title' | 'description'>;

export type DocGroup = {
	slug: string;
	label: string;
	summary: string;
	sections: { label: string; pages: DocLink[] }[];
};

export type DocHub = { title: string; description: string; html: string };

export type Docs = { hub: DocHub; groups: DocGroup[]; pages: DocPage[] };
