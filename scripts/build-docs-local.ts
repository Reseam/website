#!/usr/bin/env bun
import { mkdir, readdir, readFile, rm, writeFile, copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sources, type DocSource } from '../src/lib/docs/sources.ts';
import { IMAGE_EXT, buildIndex, renderSource, type SourceDocs } from './docs-pipeline.ts';

const here = dirname(fileURLToPath(import.meta.url));
const outFile = resolve(here, '../src/lib/docs/generated/docs.json');
const assetsRoot = resolve(here, '../static/docs-assets');
const repoRoot = resolve(here, '../..');

const LOCAL_PATHS: Record<string, string> = {
	website: resolve(repoRoot, 'website/docs'),
	engine: resolve(repoRoot, 'reseam/docs'),
	cli: resolve(repoRoot, 'reseam/crates/cli/docs'),
	api: resolve(repoRoot, 'api/docs'),
};

async function processSource(source: DocSource): Promise<SourceDocs | null> {
	const localPath = LOCAL_PATHS[source.slug];
	if (!localPath) {
		console.log(`  ${source.slug}: no local mapping, skipping`);
		return null;
	}

	let entries: string[];
	try {
		entries = await readdir(localPath);
	} catch {
		console.log(`  ${source.slug}: ${localPath} unreadable, skipping`);
		return null;
	}

	const sourceAssetDir = resolve(assetsRoot, source.slug);
	await rm(sourceAssetDir, { recursive: true, force: true });
	const imageFiles = entries.filter((name) => IMAGE_EXT.test(name));
	if (imageFiles.length > 0) await mkdir(sourceAssetDir, { recursive: true });
	for (const file of imageFiles) {
		await copyFile(resolve(localPath, file), resolve(sourceAssetDir, file));
	}

	const files = await Promise.all(
		entries
			.filter((name) => name.endsWith('.md'))
			.map(async (name) => ({
				name,
				src: await readFile(resolve(localPath, name), 'utf8'),
				editUrl: `file://${resolve(localPath, name)}`,
			}))
	);
	const docs = await renderSource(source, files);

	console.log(
		`  ${source.slug} (${localPath}): ${docs.pages.length} page(s)${docs.hub ? ' + hub' : ''} + ${imageFiles.length} image(s)`
	);
	return docs;
}

async function main() {
	console.log('Building docs.json from local sources');
	const results = new Map<string, SourceDocs>();
	for (const source of sources) {
		const entry = await processSource(source);
		if (entry) results.set(source.slug, entry);
	}
	const index = buildIndex(results);
	await mkdir(dirname(outFile), { recursive: true });
	await writeFile(outFile, JSON.stringify(index, null, '\t'));
	console.log(`Wrote ${index.pages.length} page(s) across ${index.groups.length} source(s).`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
