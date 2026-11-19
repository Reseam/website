export type Change = { app: string | null; text: string };
export type NoteSection = { kind: ChangeKind; changes: Change[] };
export type Media = { name: string; url: string; video: boolean };
export type ReleaseNotes = {
	sections: NoteSection[];
	prose: string;
	engine: string | null;
	media: Media[];
};

const CHANGE_KINDS = ['feat', 'fix', 'perf'] as const;
type ChangeKind = (typeof CHANGE_KINDS)[number];
const CONVENTIONAL = /^\s*[-*+]\s+(\w+)(?:\(([^)]+)\))?!?:\s+(.+)$/;
const MEDIA = /^\s*!\[([^\]]*)\]\((https:\/\/[^\s()]+)\)\s*$/;
const VIDEO = /\.(mp4|webm)$/i;
const ENGINE = /^\s*[-*+]\s+build:\s+require engine\s+(\S+)/m;
const APP_NAMES: Record<string, string> = {
	youtube: 'YouTube',
	'youtube-music': 'YouTube Music',
	tiktok: 'TikTok',
	gmscore: 'GmsCore',
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

/** A Markdown image on a line of its own is media, as release notes and announcements carry it; the rest is text. */
export function mediaOf(text: string): { media: Media[]; text: string } {
	const media: Media[] = [];
	const rest: string[] = [];
	for (const line of text.split('\n')) {
		const shown = MEDIA.exec(line);
		if (shown) media.push({ name: shown[1], url: shown[2], video: VIDEO.test(shown[2]) });
		else rest.push(line);
	}
	return { media, text: rest.join('\n').trim() };
}

/**
 * Release notes for people using the apps: `- type(scope): text` commit lines become New, Fixed and Faster,
 * by app, the same way Reseam Manager shows them. Build, style and other internal commits are left out,
 * except the engine a release needs. A Markdown image on a line of its own is the release's media, which
 * `reseam release` lists first. Other lines stay as written.
 */
export function parseNotes(description: string): ReleaseNotes {
	const sections = new Map<ChangeKind, Change[]>();
	const prose: string[] = [];
	const { media, text } = mediaOf(description);
	for (const line of text.split('\n')) {
		const match = CONVENTIONAL.exec(line);
		if (!match) {
			prose.push(line);
			continue;
		}
		const [, type, scope, text] = match;
		const kind = type.toLowerCase();
		if (!CHANGE_KINDS.includes(kind as ChangeKind)) continue;
		const changes = sections.get(kind as ChangeKind) ?? [];
		changes.push({
			app: scope ? scopeName(scope) : null,
			text: text.charAt(0).toUpperCase() + text.slice(1),
		});
		sections.set(kind as ChangeKind, changes);
	}
	return {
		sections: CHANGE_KINDS.filter((kind) => sections.has(kind)).map((kind) => ({
			kind,
			changes: sections.get(kind)!,
		})),
		prose: prose.join('\n').trim(),
		engine: ENGINE.exec(description)?.[1] ?? null,
		media,
	};
}
