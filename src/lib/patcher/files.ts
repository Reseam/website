import { strToU8, unzipSync, zipSync } from 'fflate';
import type { SigningKey } from './storage';

export function save(file: Blob, name: string) {
	const url = URL.createObjectURL(file);
	const link = Object.assign(document.createElement('a'), { href: url, download: name });
	link.click();
	setTimeout(() => URL.revokeObjectURL(url), 60_000);
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
