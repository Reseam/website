import { patchText, type PatchSpec, type PatchText } from '@reseam/browser';
import { m } from '#lib/paraglide/messages.js';
import { getLocale } from '#lib/paraglide/runtime.js';

export type CatalogPatch = PatchSpec & { versions: string[]; text: PatchText };

/** One group per package, largest first, with patches for any app last under the `null` key. */
export function groupByApp(patches: PatchSpec[]): Map<string | null, CatalogPatch[]> {
	const groups = new Map<string | null, CatalogPatch[]>();
	for (const patch of patches.filter((patch) => !patch.hidden)) {
		const text = patchText(patch, [getLocale()]);
		const targets =
			patch.compatibility.kind === 'packages'
				? patch.compatibility.packages
				: [{ package: null, versions: [] }];
		for (const target of targets) {
			const list = groups.get(target.package) ?? [];
			list.push({ ...patch, versions: target.versions, text });
			groups.set(target.package, list);
		}
	}
	return new Map(
		[...groups].toSorted(([a, left], [b, right]) =>
			a === null ? 1 : b === null ? -1 : right.length - left.length
		)
	);
}

export function packagesOf(groups: Map<string | null, CatalogPatch[]>) {
	return [...groups.keys()].filter((app) => app !== null);
}

export function versionText(versions: string[]) {
	if (versions.length === 0) return m.catalog_any_version();
	if (versions.length === 1) return m.version({ version: versions[0] });
	const list = new Intl.ListFormat(getLocale(), { type: 'unit', style: 'narrow' }).format(
		versions.slice(0, 3)
	);
	return versions.length > 3
		? m.catalog_versions_more({ list, count: versions.length - 3 })
		: m.catalog_versions({ list });
}

export function matches(patch: CatalogPatch, query: string) {
	const needle = query.trim().toLocaleLowerCase(getLocale());
	return (
		!needle ||
		`${patch.text.name} ${patch.text.description}`.toLocaleLowerCase(getLocale()).includes(needle)
	);
}
