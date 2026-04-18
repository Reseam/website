#!/usr/bin/env bun
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { FORGE_API, FORGE_BASE, sources, type DocSource } from '../src/lib/docs/sources.ts';
import type { DocGroup, DocPage, DocsIndex } from '../src/lib/docs/types.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outFile = resolve(here, '../src/lib/docs/generated/docs.json');
const cacheFile = resolve(here, '../.docs-cache/state.json');
const assetsRoot = resolve(here, '../static/docs-assets');

const token = process.env.FORGEJO_TOKEN;

const IMAGE_EXT = /\.(svg|png|jpe?g|gif|webp|avif)$/i;

type ForgejoEntry = { name: string; type: string; path: string; download_url: string };
type ForgejoCommit = { sha: string };
type HubEntry = { html: string; title?: string; description?: string };
type CacheEntry = { sha: string; pages: DocPage[]; hub?: HubEntry; images: string[] };
type Cache = Record<string, CacheEntry>;

async function api<T>(path: string): Promise<T | null> {
	const headers: Record<string, string> = { accept: 'application/json' };
	if (token) headers.authorization = `token ${token}`;
	const res = await fetch(`${FORGE_API}${path}`, { headers });
	if (res.status === 404) return null;
	if (!res.ok) throw new Error(`${path} → ${res.status}`);
	return res.json() as Promise<T>;
}

async function raw(url: string): Promise<string> {
	const headers: Record<string, string> = {};
	if (token) headers.authorization = `token ${token}`;
	const res = await fetch(url, { headers });
	if (!res.ok) throw new Error(`${url} → ${res.status}`);
	return res.text();
}

async function rawBytes(url: string): Promise<Uint8Array> {
	const headers: Record<string, string> = {};
	if (token) headers.authorization = `token ${token}`;
	const res = await fetch(url, { headers });
	if (!res.ok) throw new Error(`${url} → ${res.status}`);
	return new Uint8Array(await res.arrayBuffer());
}

function rewriteImagePaths(md: string, sourceSlug: string): string {
	return md.replace(/!\[([^\]]*)\]\(\s*([^)\s]+)(\s+"[^"]*")?\s*\)/g, (_m, alt, url, title) => {
		if (/^(https?:|data:|\/|#)/i.test(url)) return `![${alt}](${url}${title ?? ''})`;
		const clean = url.replace(/^\.?\//, '');
		return `![${alt}](/docs-assets/${sourceSlug}/${clean}${title ?? ''})`;
	});
}

async function readCache(): Promise<Cache> {
	if (!existsSync(cacheFile)) return {};
	try {
		return JSON.parse(await readFile(cacheFile, 'utf8')) as Cache;
	} catch {
		return {};
	}
}

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
		.replace(/^\d+_/, '')
		.replace(/\.md$/, '')
		.replace(/[-_]+/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

function titleFromHeading(md: string): string | null {
	const m = md.match(/^\s*#\s+(.+)$/m);
	return m ? m[1].trim() : null;
}

function slugFromFilename(name: string): string {
	return name.replace(/^\d+_/, '').replace(/\.md$/, '');
}

function sectionFromFilename(name: string): number | null {
	const m = name.match(/^(\d+)_/);
	return m ? Number(m[1]) : null;
}

async function fetchSource(source: DocSource, cache: Cache): Promise<CacheEntry | null> {
	const branch = source.branch ?? 'main';
	const path = source.path ?? 'docs';

	const commits = await api<ForgejoCommit[]>(
		`/repos/${source.repo}/commits?path=${encodeURIComponent(path)}&limit=1&sha=${branch}`
	);
	const sha = commits?.[0]?.sha;
	if (!sha) {
		console.log(`  ${source.repo}: no ${path}/ yet — skipping`);
		return null;
	}

	const sourceAssetDir = resolve(assetsRoot, source.slug);
	const cached = cache[source.repo];
	if (cached && cached.sha === sha) {
		const imagesPresent = (cached.images ?? []).every((name) =>
			existsSync(resolve(sourceAssetDir, name))
		);
		if (imagesPresent) {
			console.log(`  ${source.repo}: up to date (${sha.slice(0, 7)})`);
			return cached;
		}
		console.log(`  ${source.repo}: cache hit but assets missing — refetching`);
	}

	const entries = await api<ForgejoEntry[]>(`/repos/${source.repo}/contents/${path}?ref=${branch}`);
	if (!entries) return null;
	const mdFiles = entries.filter((e) => e.type === 'file' && e.name.endsWith('.md'));
	const imageFiles = entries.filter((e) => e.type === 'file' && IMAGE_EXT.test(e.name));

	await rm(sourceAssetDir, { recursive: true, force: true });
	if (imageFiles.length > 0) await mkdir(sourceAssetDir, { recursive: true });
	const imageNames: string[] = [];
	for (const file of imageFiles) {
		const bytes = await rawBytes(file.download_url);
		await writeFile(resolve(sourceAssetDir, file.name), bytes);
		imageNames.push(file.name);
	}

	const pages: DocPage[] = [];
	let hub: HubEntry | undefined;
	for (const file of mdFiles) {
		const src = await raw(file.download_url);
		const { data, body } = parseFrontmatter(src);
		const title = data.title || titleFromHeading(body) || titleFromFilename(file.name);
		const strippedBody = body.replace(/^\s*#\s+.+\n?/, '');
		const rewritten = rewriteImagePaths(strippedBody, source.slug);
		const html = await marked.parse(rewritten, { async: true });

		if (source.hub && file.name === 'index.md') {
			hub = {
				html,
				title,
				description: data.description,
			};
			continue;
		}

		const fileSlug = slugFromFilename(file.name);
		const section = sectionFromFilename(file.name);
		const orderMatch = file.name.match(/^(\d+)_(\d+)?/);
		const order = orderMatch?.[2] ? Number(orderMatch[2]) : (section ?? Infinity);
		pages.push({
			slug: `${source.slug}/${fileSlug}`,
			sourceSlug: source.slug,
			sourceLabel: source.label,
			section,
			order: Number.isFinite(order) ? order : 999,
			title,
			description: data.description,
			html,
			editUrl: `${FORGE_BASE}/${source.repo}/_edit/${branch}/${file.path}`,
		});
	}

	pages.sort((a, b) => {
		const sa = a.section ?? Infinity;
		const sb = b.section ?? Infinity;
		if (sa !== sb) return sa - sb;
		if (a.order !== b.order) return a.order - b.order;
		return a.title.localeCompare(b.title);
	});

	const imgLabel = imageNames.length > 0 ? ` + ${imageNames.length} image(s)` : '';
	console.log(
		`  ${source.repo}: ${pages.length} page(s)${hub ? ' + hub' : ''}${imgLabel} @ ${sha.slice(0, 7)}`
	);
	return { sha, pages, hub, images: imageNames };
}

function buildIndex(results: Map<string, CacheEntry>): DocsIndex {
	const groups: DocGroup[] = [];
	const allPages: DocPage[] = [];
	let hub: HubEntry | undefined;
	for (const source of sources) {
		const entry = results.get(source.repo);
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

async function main() {
	console.log(`Fetching docs from ${FORGE_BASE}`);
	const cache = await readCache();
	const results = new Map<string, CacheEntry>();
	const nextCache: Cache = {};

	for (const source of sources) {
		const entry = await fetchSource(source, cache);
		if (entry) {
			results.set(source.repo, entry);
			nextCache[source.repo] = entry;
		}
	}

	const index = buildIndex(results);
	await mkdir(dirname(outFile), { recursive: true });
	await mkdir(dirname(cacheFile), { recursive: true });
	await writeFile(outFile, JSON.stringify(index, null, '\t'));
	await writeFile(cacheFile, JSON.stringify(nextCache, null, '\t'));
	console.log(`Wrote ${index.pages.length} page(s) across ${index.groups.length} source(s).`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
