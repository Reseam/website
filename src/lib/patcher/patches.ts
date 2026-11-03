import type { InspectResponse, PatchMetadata } from '@reseam/browser';

export function reference(patch: PatchMetadata): string {
	return `${patch.bundle}/${patch.id}`;
}

/** Versions the loaded patches declare for this package, newest last as published. */
export function supportedVersions(inspection: InspectResponse): string[] {
	const name = inspection.apk?.package_name;
	const versions = inspection.patches.flatMap((patch) =>
		patch.compatibility.kind === 'packages'
			? patch.compatibility.packages
					.filter((entry) => entry.package === name)
					.flatMap((entry) => entry.versions)
			: []
	);
	return [...new Set(versions)];
}
