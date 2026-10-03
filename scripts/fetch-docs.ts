#!/usr/bin/env bun
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { FORGE_API, FORGE_BASE, sources, type DocSource } from '../src/lib/docs/sources.ts';
import type { DocPage } from '../src/lib/docs/types.ts';
import { ASSETS_ROOT, IMAGE_EXT, renderSource, writeDocs } from './docs-pipeline.ts';

type Entry = { name: string; type: string; path: string; download_url: string };

const headers: Record<string, string> = process.env.FORGEJO_TOKEN
	? { authorization: `token ${process.env.FORGEJO_TOKEN}` }
	: {};

async function get(url: string): Promise<Response> {
	const response = await fetch(url, { headers });
	if (!response.ok) throw new Error(`${url} returned ${response.status}`);
	return response;
}

async function fetchSource(source: DocSource): Promise<DocPage[]> {
	const listing = `${FORGE_API}/repos/${source.repo}/contents/${source.path}?ref=${source.branch}`;
	const entries: Entry[] = await (await get(listing)).json();
	const files = entries.filter((entry) => entry.type === 'file');

	const assets = resolve(ASSETS_ROOT, source.slug);
	await rm(assets, { recursive: true, force: true });
	await mkdir(assets, { recursive: true });
	for (const image of files.filter((file) => IMAGE_EXT.test(file.name))) {
		await writeFile(resolve(assets, image.name), await (await get(image.download_url)).bytes());
	}

	const markdown = await Promise.all(
		files
			.filter((file) => file.name.endsWith('.md'))
			.map(async (file) => ({
				name: file.name,
				src: await (await get(file.download_url)).text(),
				editUrl: `${FORGE_BASE}/${source.repo}/_edit/${source.branch}/${file.path}`,
			}))
	);
	return renderSource(source, markdown);
}

const rendered = new Map<string, DocPage[]>();
for (const source of sources) rendered.set(source.slug, await fetchSource(source));
await writeDocs(rendered);
