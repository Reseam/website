#!/usr/bin/env bun
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORGE_API, FORGE_BASE, sources, type DocSource } from '../src/lib/docs/sources.ts';
import { IMAGE_EXT, buildIndex, renderSource, type SourceDocs } from './docs-pipeline.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outFile = resolve(here, '../src/lib/docs/generated/docs.json');
const cacheFile = resolve(here, '../.docs-cache/state.json');
const assetsRoot = resolve(here, '../static/docs-assets');

const token = process.env.FORGEJO_TOKEN;

type ForgejoEntry = { name: string; type: string; path: string; download_url: string };
type ForgejoCommit = { sha: string };
type CacheEntry = SourceDocs & { sha: string; images: string[] };
type Cache = Record<string, CacheEntry>;

function authHeaders(): Record<string, string> {
	return token ? { authorization: `token ${token}` } : {};
}

async function api<T>(path: string): Promise<T | null> {
	const res = await fetch(`${FORGE_API}${path}`, {
		headers: { accept: 'application/json', ...authHeaders() },
	});
	if (res.status === 404) return null;
	if (!res.ok) throw new Error(`${path} -> ${res.status}`);
	return res.json() as Promise<T>;
}

async function raw(url: string): Promise<Response> {
	const res = await fetch(url, { headers: authHeaders() });
	if (!res.ok) throw new Error(`${url} -> ${res.status}`);
	return res;
}

async function readCache(): Promise<Cache> {
	if (!existsSync(cacheFile)) return {};
	try {
		return JSON.parse(await readFile(cacheFile, 'utf8')) as Cache;
	} catch {
		return {};
	}
}

async function fetchSource(source: DocSource, cache: Cache): Promise<CacheEntry | null> {
	const branch = source.branch ?? 'main';
	const path = source.path ?? 'docs';

	const commits = await api<ForgejoCommit[]>(
		`/repos/${source.repo}/commits?path=${encodeURIComponent(path)}&limit=1&sha=${branch}`
	);
	const sha = commits?.[0]?.sha;
	if (!sha) {
		console.log(`  ${source.slug} (${source.repo}): no ${path}/ yet, skipping`);
		return null;
	}

	const sourceAssetDir = resolve(assetsRoot, source.slug);
	const cached = cache[source.slug];
	if (cached && cached.sha === sha) {
		const imagesPresent = (cached.images ?? []).every((name) =>
			existsSync(resolve(sourceAssetDir, name))
		);
		if (imagesPresent) {
			console.log(`  ${source.slug} (${source.repo}): up to date (${sha.slice(0, 7)})`);
			return cached;
		}
		console.log(`  ${source.slug} (${source.repo}): cache hit but assets missing, refetching`);
	}

	const entries = await api<ForgejoEntry[]>(`/repos/${source.repo}/contents/${path}?ref=${branch}`);
	if (!entries) return null;
	const mdFiles = entries.filter((e) => e.type === 'file' && e.name.endsWith('.md'));
	const imageFiles = entries.filter((e) => e.type === 'file' && IMAGE_EXT.test(e.name));

	await rm(sourceAssetDir, { recursive: true, force: true });
	if (imageFiles.length > 0) await mkdir(sourceAssetDir, { recursive: true });
	const images: string[] = [];
	for (const file of imageFiles) {
		const bytes = new Uint8Array(await (await raw(file.download_url)).arrayBuffer());
		await writeFile(resolve(sourceAssetDir, file.name), bytes);
		images.push(file.name);
	}

	const files = await Promise.all(
		mdFiles.map(async (file) => ({
			name: file.name,
			src: await (await raw(file.download_url)).text(),
			editUrl: `${FORGE_BASE}/${source.repo}/_edit/${branch}/${file.path}`,
		}))
	);
	const { pages, hub } = await renderSource(source, files);

	const imgLabel = images.length > 0 ? ` + ${images.length} image(s)` : '';
	console.log(
		`  ${source.slug} (${source.repo}): ${pages.length} page(s)${hub ? ' + hub' : ''}${imgLabel} @ ${sha.slice(0, 7)}`
	);
	return { sha, pages, hub, images };
}

async function main() {
	console.log(`Fetching docs from ${FORGE_BASE}`);
	const cache = await readCache();
	const results = new Map<string, SourceDocs>();
	const nextCache: Cache = {};

	for (const source of sources) {
		const entry = await fetchSource(source, cache);
		if (entry) {
			results.set(source.slug, entry);
			nextCache[source.slug] = entry;
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
