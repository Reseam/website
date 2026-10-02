import type { Inspection, PatchMetadata, Preset } from '@reseam/browser';

export function reference(patch: PatchMetadata): string {
	return `${patch.bundle}/${patch.id}`;
}

/** Patches that apply to the package at all; version mismatches are decided separately. */
export function forPackage(inspection: Inspection): PatchMetadata[] {
	const name = inspection.apk?.package_name;
	return inspection.patches.filter(
		(patch) =>
			patch.compatibility.kind === 'universal' ||
			patch.compatibility.packages.some((entry) => entry.package === name)
	);
}

export function runnable(patch: PatchMetadata, ignoreVersions: boolean): boolean {
	return !patch.incompatibility || ignoreVersions;
}

export function preset(patches: PatchMetadata[], value: Preset, ignoreVersions: boolean): string[] {
	return patches
		.filter((patch) => !patch.hidden && runnable(patch, ignoreVersions))
		.filter((patch) => patch.presets.includes(value))
		.map(reference);
}

/** Maps every patch that will run to the chosen patches that pulled it in; chosen patches map to none. */
export function closure(chosen: Iterable<string>, patches: PatchMetadata[]): Map<string, string[]> {
	const byReference = new Map(patches.map((patch) => [reference(patch), patch]));
	const running = new Map<string, string[]>();
	const visit = (key: string, root: string | undefined) => {
		const requiredBy = running.get(key);
		if (requiredBy) {
			if (root && root !== key && !requiredBy.includes(root)) requiredBy.push(root);
			return;
		}
		running.set(key, root && root !== key ? [root] : []);
		for (const dependency of byReference.get(key)?.dependencies ?? [])
			visit(dependency, root ?? key);
	};
	for (const key of chosen) visit(key, undefined);
	for (const key of chosen) running.set(key, []);
	return running;
}

/** Versions the loaded patches declare for this package, newest last as published. */
export function supportedVersions(inspection: Inspection): string[] {
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
