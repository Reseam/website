import { fetchAnnouncements, fetchManagerIndex, fetchPatchesIndex } from '#lib/api.ts';
import { parseNotes, type ReleaseNotes } from '#lib/notes.ts';
import type { Announcement, ReleaseIndex } from '#lib/types.ts';

export type ReleaseKind = 'patches' | 'manager';

export type ReleaseEntry = {
	kind: ReleaseKind;
	key: string;
	title: string;
	date: string;
	notes: ReleaseNotes;
	downloadUrl: string;
};

export type NewsEntry = {
	kind: 'news';
	key: string;
	title: string;
	date: string;
	announcement: Announcement;
};

export type UpdateEntry = ReleaseEntry | NewsEntry;

export const KINDS = [
	{ value: 'patches', label: 'Patches' },
	{ value: 'manager', label: 'Reseam Manager' },
	{ value: 'news', label: 'Announcements' },
] as const;

const PRODUCTS: Record<ReleaseKind, string> = {
	patches: 'Reseam Patches',
	manager: 'Reseam Manager',
};

export function updateEntries(
	patches: ReleaseIndex,
	manager: ReleaseIndex,
	announcements: Announcement[]
): UpdateEntry[] {
	const releases = (kind: ReleaseKind, index: ReleaseIndex): ReleaseEntry[] =>
		index.releases
			.filter((release) => !release.prerelease)
			.map((release) => ({
				kind,
				key: release.version,
				title: `${PRODUCTS[kind]} ${release.version}`,
				date: release.created_at,
				notes: parseNotes(release.description),
				downloadUrl: release.download_url,
			}));
	const news = announcements.map((announcement): NewsEntry => ({
		kind: 'news',
		key: String(announcement.id),
		title: announcement.title,
		date: announcement.created_at,
		announcement,
	}));
	return [...releases('patches', patches), ...releases('manager', manager), ...news].toSorted(
		(a, b) => b.date.localeCompare(a.date)
	);
}

export async function loadUpdates(apiUrl: string, fetcher: typeof fetch = fetch) {
	const [patches, manager, announcements] = await Promise.all([
		fetchPatchesIndex(apiUrl, fetcher),
		fetchManagerIndex(apiUrl, fetcher),
		fetchAnnouncements(apiUrl, fetcher),
	]);
	return updateEntries(patches, manager, announcements);
}

export const entryPath = (entry: Pick<UpdateEntry, 'kind' | 'key'>) =>
	`/updates/${entry.kind}/${entry.key}/`;

export function summary(entry: UpdateEntry) {
	if (entry.kind === 'news') return entry.announcement.content ?? '';
	const changes = entry.notes.sections
		.flatMap((section) => section.changes)
		.map((change) => (change.app ? `${change.app}: ${change.text}` : change.text));
	return changes.length > 0 ? changes.join('. ') : entry.notes.prose;
}

export const hasChanges = (entry: ReleaseEntry) =>
	entry.notes.sections.length > 0 || entry.notes.prose.length > 0;
