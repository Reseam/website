import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import markedAlert from 'marked-alert';
import { getHeadingList, gfmHeadingId, resetHeadings } from 'marked-gfm-heading-id';
import markedShiki from 'marked-shiki';
import { createHighlighter } from 'shiki';
import { sources, type DocSource } from '../src/lib/docs/sources.ts';
import type { DocHub, DocPage, Docs } from '../src/lib/docs/types.ts';

const THEME = 'vitesse-dark';
const LANGS = [
	'bash',
	'diff',
	'dockerfile',
	'ini',
	'json',
	'kotlin',
	'nginx',
	'rust',
	'shell',
	'toml',
	'typescript',
	'yaml',
];

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const ASSETS_ROOT = resolve(root, 'static/docs-assets');
export const IMAGE_EXT = /\.(svg|png|jpe?g|gif|webp|avif)$/i;

export type MarkdownFile = { name: string; src: string; editUrl: string };

const highlighter = await createHighlighter({ themes: [THEME], langs: LANGS });
const loaded = new Set(highlighter.getLoadedLanguages());

marked.use(
	gfmHeadingId(),
	markedAlert(),
	markedShiki({
		highlight: (code, lang) =>
			highlighter.codeToHtml(code, { lang: loaded.has(lang) ? lang : 'text', theme: THEME }),
	})
);

function frontmatter(src: string): { data: Record<string, string>; body: string } {
	const match = src.match(/^---\n([\s\S]*?)\n---\n?/);
	if (!match) return { data: {}, body: src };
	const data = Object.fromEntries(
		match[1]
			.split('\n')
			.map((line) => line.match(/^([\w-]+)\s*:\s*(.*)$/))
			.filter((entry) => entry !== null)
			.map(([, key, value]) => [key, value.replace(/^["']|["']$/g, '').trim()])
	);
	return { data, body: src.slice(match[0].length) };
}

const slugOf = (name: string) => name.replace(/^\d+_(\d+_)?/, '').replace(/\.md$/, '');

/** `3_name.md` is the third page of the guide, `2_5_name.md` sits after `2_0_`, unnumbered files are reference. */
function position(name: string): [number, number] | null {
	const match = name.match(/^(\d+)_(?:(\d+)_)?/);
	return match ? [Number(match[1]), Number(match[2] ?? 0)] : null;
}

function rewriteLinks(md: string, source: string): string {
	return md
		.replace(
			/!\[([^\]]*)\]\(\s*(?!https?:|data:|\/|#)\.?\/?([^)\s]+)/g,
			`![$1](/docs-assets/${source}/$2`
		)
		.replace(
			/(?<!!)\[([^\]]+)\]\(\s*(?!https?:|mailto:|\/|#)(?:[^)\s]*\/)?([^)\s/#]+)\.md(#[^)\s]*)?/g,
			(_, text, file, hash = '') =>
				// Each folder's README is its index, which the hub's section for that source replaces.
				file === 'README'
					? `[${text}](/docs/#group-${source}`
					: `[${text}](/docs/${source}/${slugOf(file)}/${hash}`
		);
}

async function render(markdown: string) {
	resetHeadings();
	const html = await marked.parse(markdown, { async: true });
	const headings = getHeadingList()
		.filter((heading) => heading.level === 2 || heading.level === 3)
		.map(({ id, text, level }) => ({ id, level, text: text.replace(/<[^>]+>/g, '') }));
	return { html, headings };
}

export async function renderSource(source: DocSource, files: MarkdownFile[]): Promise<DocPage[]> {
	const pages: (DocPage & { position: [number, number] | null })[] = [];
	for (const file of files.filter((file) => file.name !== 'README.md')) {
		const { data, body } = frontmatter(file.src);
		const title = data.title ?? body.match(/^#\s+(.+)$/m)?.[1].trim() ?? slugOf(file.name);
		const markdown = rewriteLinks(body.replace(/^\s*#\s+.+\n?/, ''), source.slug);
		pages.push({
			slug: `${source.slug}/${slugOf(file.name)}`,
			source: source.slug,
			section: position(file.name) ? 'Guide' : 'Reference',
			title,
			description: data.description,
			...(await render(markdown)),
			editUrl: file.editUrl,
			position: position(file.name),
		});
	}
	const rank = (page: (typeof pages)[number]) => page.position ?? [Infinity, 0];
	return pages
		.toSorted(
			(a, b) => rank(a)[0] - rank(b)[0] || rank(a)[1] - rank(b)[1] || a.title.localeCompare(b.title)
		)
		.map(({ position: _, ...page }) => page);
}

export async function renderHub(): Promise<DocHub> {
	const { data, body } = frontmatter(await readFile(resolve(root, 'docs/index.md'), 'utf8'));
	if (!data.title || !data.description)
		throw new Error('docs/index.md needs a title and description');
	return {
		title: data.title,
		description: data.description,
		html: (await render(body.replace(/^\s*#\s+.+\n?/, ''))).html,
	};
}

export async function writeDocs(rendered: Map<string, DocPage[]>) {
	const pages = sources.flatMap((source) => rendered.get(source.slug) ?? []);
	const seen = new Map<string, string>();
	for (const page of pages) {
		const other = seen.get(page.slug);
		if (other)
			throw new Error(`Two docs pages map to /docs/${page.slug}/: ${other} and ${page.editUrl}`);
		seen.set(page.slug, page.editUrl);
	}
	const docs: Docs = {
		hub: await renderHub(),
		groups: sources
			.filter((source) => rendered.get(source.slug)?.length)
			.map((source) => {
				const own = rendered.get(source.slug)!;
				return {
					slug: source.slug,
					label: source.label,
					summary: source.summary,
					sections: ['Guide', 'Reference']
						.map((label) => ({
							label,
							pages: own
								.filter((page) => page.section === label)
								.map(({ slug, title, description }) => ({ slug, title, description })),
						}))
						.filter((section) => section.pages.length > 0),
				};
			}),
		pages,
	};
	const out = resolve(root, 'src/lib/server/docs.json');
	await mkdir(dirname(out), { recursive: true });
	await writeFile(out, JSON.stringify(docs));
	console.log(`Wrote ${pages.length} docs pages across ${docs.groups.length} sources.`);
}
