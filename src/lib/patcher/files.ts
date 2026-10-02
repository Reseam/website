import { strToU8, unzipSync, Zip, ZipPassThrough, zipSync } from 'fflate';
import type { SigningKey } from './storage';

export function save(file: Blob, name: string) {
	const url = URL.createObjectURL(file);
	const link = Object.assign(document.createElement('a'), { href: url, download: name });
	link.click();
	setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Packs a split set as .apks, the archive split-aware installers and Reseam Manager use. */
export async function splitArchive(apks: File[]): Promise<Blob> {
	const chunks: Uint8Array[] = [];
	const result: { error?: Error } = {};
	const zip = new Zip((error, chunk) => {
		if (error) result.error = error;
		else chunks.push(chunk);
	});
	for (const apk of apks.toSorted((left, right) => left.name.localeCompare(right.name))) {
		// APKs are already compressed, so entries are stored.
		const entry = new ZipPassThrough(apk.name);
		zip.add(entry);
		const reader = apk.stream().getReader();
		for (let read = await reader.read(); !read.done; read = await reader.read()) {
			entry.push(read.value);
		}
		entry.push(new Uint8Array(), true);
	}
	zip.end();
	if (result.error) throw result.error;
	return new Blob(chunks as BlobPart[], { type: 'application/zip' });
}

const KEY = 'reseam.pk8';
const CERT = 'reseam.der';

export function keyBackup(key: SigningKey): Blob {
	const readme = strToU8(
		'Reseam signing key. Import both files to keep updating apps you patched with it.\n'
	);
	const archive = zipSync({
		[KEY]: new Uint8Array(key.key),
		[CERT]: new Uint8Array(key.cert),
		'README.txt': readme,
	});
	return new Blob([archive as BlobPart], { type: 'application/zip' });
}

export async function readKey(files: File[]): Promise<SigningKey> {
	if (files.some((file) => file.size > 1_048_576)) throw new Error('These files are too large.');
	const entries: Record<string, Uint8Array> = {};
	for (const file of files) {
		const bytes = new Uint8Array(await file.arrayBuffer());
		if (file.name.toLowerCase().endsWith('.zip')) {
			for (const [name, data] of Object.entries(unzipSync(bytes))) {
				entries[name.split('/').at(-1)!.toLowerCase()] = data;
			}
		} else entries[file.name.toLowerCase()] = bytes;
	}
	const pick = (suffix: string) =>
		Object.entries(entries).find(([name]) => name.endsWith(suffix))?.[1];
	const key = pick('.pk8');
	const cert = pick('.der');
	if (!key || !cert) throw new Error('Choose the key backup, or both the .pk8 and .der files.');
	return { key: key.slice().buffer, cert: cert.slice().buffer };
}

export async function fingerprint(cert: ArrayBuffer): Promise<string> {
	const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', cert));
	return [...digest].map((byte) => byte.toString(16).padStart(2, '0').toUpperCase()).join(':');
}
