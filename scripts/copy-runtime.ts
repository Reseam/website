#!/usr/bin/env bun
import { cp, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// The patcher fetches its engine and Java runtime from /runtime/<hash>/, so they ship as static files.
const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(
	dirname(fileURLToPath(import.meta.resolve('@reseam/browser/package.json'))),
	'public/runtime'
);
const target = resolve(here, '../static/runtime');

await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });
