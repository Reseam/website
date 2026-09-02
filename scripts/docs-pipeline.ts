import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import markedShiki from 'marked-shiki';
import { createHighlighter } from 'shiki';
import { sources, type DocSource } from '../src/lib/docs/sources.ts';
import type { DocGroup, DocPage, DocsIndex } from '../src/lib/docs/types.ts';

const SHIKI_THEME = 'vitesse-dark';
const SHIKI_LANGS = [
	'bash',
	'css',
	'diff',
	'dockerfile',
	'go',
	'html',
	'ini',
	'json',
	'jsonc',
	'kotlin',
	'markdown',
	'nginx',
	'python',
	'rust',
	'shell',
	'sql',
	'svelte',
	'toml',
	'tsx',
	'typescript',
	'yaml',
];

const highlighter = await createHighlighter({ themes: [SHIKI_THEME], langs: SHIKI_LANGS });
const supportedLangs = new Set(highlighter.getLoadedLanguages());

marked.use(gfmHeadingId());
marked.use(
	markedShiki({
		highlight(code, lang) {
			const resolved = supportedLangs.has(lang) ? lang : 'text';
			return highlighter.codeToHtml(code, { lang: resolved, theme: SHIKI_THEME });
		},
	})
);

export const IMAGE_EXT = /\.(svg|png|jpe?g|gif|webp|avif)$/i;

export type HubEntry = { html: string; title?: string; description?: string };
export type SourceDocs = { pages: DocPage[]; hub?: HubEntry };
export type MarkdownFile = { name: string; src: string; editUrl: string };

function parseFrontmatter(src: string): { data: Record<string, string>; body: string } {
	if (!src.startsWith('---\n')) return { data: {}, body: src };
	const end = src.indexOf('\n---', 4);
	if (end === -1) return { data: {}, body: src };
	const block = src.slice(4, end);
	const body = src.slice(end + 4).replace(/^\n/, '');
	const data: Record<string, string> = {};
	for (const line of block.split('\n')) {
		const m = line.match(/^([\w-]+)\s*:\s*(.*)$/);
		if (m) data[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
	}
	return { data, body };
}

function titleFromFilename(name: string): string {
	return name
		.replace(/^\d+_(\d+_)?/, '')
		.replace(/\.md$/, '')
		.replace(/[-_]+/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

function titleFromHeading(md: string): string | null {
	const m = md.match(/^\s*#\s+(.+)$/m);
	return m ? m[1].trim() : null;
}

function slugFromFilename(name: string): string {
	return name.replace(/^\d+_(\d+_)?/, '').replace(/\.md$/, '');
}

function sectionFromFilename(name: string): number | null {
	const m = name.match(/^(\d+)_/);
	return m ? Number(m[1]) : null;
}

function rewriteImagePaths(md: string, sourceSlug: string): string {
	return md.replace(/!\[([^\]]*)\]\(\s*([^)\s]+)(\s+"[^"]*")?\s*\)/g, (_m, alt, url, title) => {
		if (/^(https?:|data:|\/|#)/i.test(url)) return `![${alt}](${url}${title ?? ''})`;
		const clean = url.replace(/^\.?\//, '');
		return `![${alt}](/docs-assets/${sourceSlug}/${clean}${title ?? ''})`;
	});
}

function rewriteDocLinks(md: string, sourceSlug: string): string {
	return md.replace(
		/(?<!!)\[([^\]]+)\]\(\s*([^)\s#]+)(#[^)\s]+)?(\s+"[^"]*")?\s*\)/g,
		(_m, text, url, hash, title) => {
			if (/^(https?:|mailto:|data:|\/|#)/i.test(url)) return _m;
			if (!/\.md$/i.test(url)) return _m;
			const file =
				url
					.replace(/^\.?\//, '')
					.split('/')
					.pop() ?? url;
			const slug = slugFromFilename(file);
			return `[${text}](/docs/${sourceSlug}/${slug}${hash ?? ''}${title ?? ''})`;
		}
	);
}

export async function renderSource(source: DocSource, files: MarkdownFile[]): Promise<SourceDocs> {
	const pages: DocPage[] = [];
	let hub: HubEntry | undefined;

	for (const file of files) {
		const { data, body } = parseFrontmatter(file.src);
		const title = data.title || titleFromHeading(body) || titleFromFilename(file.name);
		const strippedBody = body.replace(/^\s*#\s+.+\n?/, '');
		const withImages = rewriteImagePaths(strippedBody, source.slug);
		const withLinks = rewriteDocLinks(withImages, source.slug);
		const html = await marked.parse(withLinks, { async: true });

		if (source.hub && file.name === 'index.md') {
			hub = { html, title, description: data.description };
			continue;
		}

		const section = sectionFromFilename(file.name);
		const orderMatch = file.name.match(/^(\d+)_(\d+)?/);
		const order = orderMatch?.[2] ? Number(orderMatch[2]) : (section ?? Infinity);
		pages.push({
			slug: `${source.slug}/${slugFromFilename(file.name)}`,
			sourceSlug: source.slug,
			sourceLabel: source.label,
			section,
			order: Number.isFinite(order) ? order : 999,
			title,
			description: data.description,
			html,
			editUrl: file.editUrl,
		});
	}

	pages.sort((a, b) => {
		const sa = a.section ?? Infinity;
		const sb = b.section ?? Infinity;
		if (sa !== sb) return sa - sb;
		if (a.order !== b.order) return a.order - b.order;
		return a.title.localeCompare(b.title);
	});

	return { pages, hub };
}

export function buildIndex(results: Map<string, SourceDocs>): DocsIndex {
	const groups: DocGroup[] = [];
	const allPages: DocPage[] = [];
	let hub: HubEntry | undefined;
	for (const source of sources) {
		const entry = results.get(source.slug);
		if (!entry) continue;
		if (source.hub && entry.hub) hub = entry.hub;
		if (entry.pages.length === 0) continue;
		const bySection = new Map<string, DocPage[]>();
		for (const page of entry.pages) {
			const key = page.section === null ? 'standalone' : String(page.section);
			const list = bySection.get(key) ?? [];
			list.push(page);
			bySection.set(key, list);
			allPages.push(page);
		}
		const sectionEntries = Array.from(bySection.entries()).sort(([a], [b]) => {
			if (a === 'standalone') return 1;
			if (b === 'standalone') return -1;
			return Number(a) - Number(b);
		});
		groups.push({
			slug: source.slug,
			label: source.label,
			sections: sectionEntries.map(([key, pages]) => ({
				key,
				label: key === 'standalone' ? 'Reference' : `Part ${key}`,
				pages,
			})),
		});
	}
	return { groups, pages: allPages, hub, generatedAt: new Date().toISOString() };
}
