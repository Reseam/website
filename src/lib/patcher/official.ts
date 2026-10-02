import { fetchLatestPatches } from '$lib/api';

/** Signer of the official Reseam patches. Its bundles run without asking. */
export const OFFICIAL_SIGNER = '556c1b22f4e03398212ba10fe6a31db252df49f599b938d24a9f2b6baec41a1d';

export type OfficialBundle = { name: string; version: string; file: File };

export async function fetchOfficialBundle(apiUrl: string): Promise<OfficialBundle> {
	const { bundle, release } = await fetchLatestPatches(apiUrl);
	const response = await fetch(release.download_url);
	if (!response.ok) throw new Error(`Download failed (${response.status})`);
	return {
		name: bundle.name,
		version: release.version,
		file: new File([await response.blob()], `${bundle.name}.reseam`),
	};
}
