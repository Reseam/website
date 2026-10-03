#!/usr/bin/env bun
import { copyFile, mkdir, readdir, readFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sources } from '../src/lib/docs/sources.ts';
import type { DocPage } from '../src/lib/docs/types.ts';
import { ASSETS_ROOT, IMAGE_EXT, renderSource, writeDocs } from './docs-pipeline.ts';

// Sibling checkouts in the Reseam monorepo, named after each source's repository.
const monorepo = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

const rendered = new Map<string, DocPage[]>();
for (const source of sources) {
	const directory = resolve(monorepo, source.repo.split('/')[1], source.path);
	const names = await readdir(directory);

	const assets = resolve(ASSETS_ROOT, source.slug);
	await rm(assets, { recursive: true, force: true });
	await mkdir(assets, { recursive: true });
	for (const name of names.filter((name) => IMAGE_EXT.test(name))) {
		await copyFile(resolve(directory, name), resolve(assets, name));
	}

	const markdown = await Promise.all(
		names
			.filter((name) => name.endsWith('.md'))
			.map(async (name) => ({
				name,
				src: await readFile(resolve(directory, name), 'utf8'),
				editUrl: `file://${resolve(directory, name)}`,
			}))
	);
	rendered.set(source.slug, await renderSource(source, markdown));
}
await writeDocs(rendered);
