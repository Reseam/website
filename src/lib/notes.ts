export type Change = { app: string | null; text: string };
export type NoteSection = { kind: ChangeKind; title: string; changes: Change[] };
export type ReleaseNotes = { sections: NoteSection[]; prose: string; engine: string | null };

type ChangeKind = 'feat' | 'fix' | 'perf';

const SECTIONS: Record<ChangeKind, string> = { feat: 'New', fix: 'Fixed', perf: 'Faster' };
const CONVENTIONAL = /^\s*[-*+]\s+(\w+)(?:\(([^)]+)\))?!?:\s+(.+)$/;
const ENGINE = /^\s*[-*+]\s+build:\s+require engine\s+(\S+)/m;
const APP_NAMES: Record<string, string> = {
	youtube: 'YouTube',
	'youtube-music': 'YouTube Music',
	tiktok: 'TikTok',
};

export function scopeName(scope: string) {
	return (
		APP_NAMES[scope] ??
		scope
			.split(/[-_]/)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ')
	);
}

/**
 * Release notes for people using the apps: `- type(scope): text` commit lines become New, Fixed and Faster,
 * by app, the same way Reseam Manager shows them. Build, style and other internal commits are left out,
 * except the engine a release needs. Lines that are not commits stay as written.
 */
export function parseNotes(description: string): ReleaseNotes {
	const sections = new Map<ChangeKind, Change[]>();
	const prose: string[] = [];
	for (const line of description.split('\n')) {
		const match = CONVENTIONAL.exec(line);
		if (!match) {
			prose.push(line);
			continue;
		}
		const [, type, scope, text] = match;
		const kind = type.toLowerCase();
		if (!(kind in SECTIONS)) continue;
		const changes = sections.get(kind as ChangeKind) ?? [];
		changes.push({
			app: scope ? scopeName(scope) : null,
			text: text.charAt(0).toUpperCase() + text.slice(1),
		});
		sections.set(kind as ChangeKind, changes);
	}
	return {
		sections: (Object.keys(SECTIONS) as ChangeKind[])
			.filter((kind) => sections.has(kind))
			.map((kind) => ({ kind, title: SECTIONS[kind], changes: sections.get(kind)! })),
		prose: prose.join('\n').trim(),
		engine: ENGINE.exec(description)?.[1] ?? null,
	};
}
