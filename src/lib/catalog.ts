import type { PatchInfo } from '#lib/types.ts';

export type CatalogPatch = PatchInfo & { versions: string[] };

/** One group per package, largest first, with patches for any app last under the `null` key. */
export function groupByApp(patches: PatchInfo[]): Map<string | null, CatalogPatch[]> {
	const groups = new Map<string | null, CatalogPatch[]>();
	for (const patch of patches.filter((patch) => !patch.hidden)) {
		const targets =
			patch.compatibility.kind === 'packages'
				? patch.compatibility.packages
				: [{ package: null, versions: [] }];
		for (const target of targets) {
			const list = groups.get(target.package) ?? [];
			list.push({ ...patch, versions: target.versions });
			groups.set(target.package, list);
		}
	}
	return new Map(
		[...groups].toSorted(([a, left], [b, right]) =>
			a === null ? 1 : b === null ? -1 : right.length - left.length
		)
	);
}

export function versionText(versions: string[]) {
	if (versions.length === 0) return 'Any version';
	if (versions.length === 1) return `Version ${versions[0]}`;
	const shown = versions.slice(0, 3).join(', ');
	return versions.length > 3
		? `Versions ${shown} and ${versions.length - 3} more`
		: `Versions ${shown}`;
}

export function matches(patch: PatchInfo, query: string) {
	const needle = query.trim().toLocaleLowerCase();
	return !needle || `${patch.name} ${patch.description}`.toLocaleLowerCase().includes(needle);
}
