import type { BadgeTone } from '#lib/components/ui/Badge.svelte';
import type { AnnouncementLevel } from '#lib/types.ts';
import { m } from '#lib/paraglide/messages.js';

export const LEVELS: Record<AnnouncementLevel, { label: () => string; tone: BadgeTone }> = {
	0: { label: m.announcement_news, tone: 'primary' },
	1: { label: m.announcement_notice, tone: 'info' },
	2: { label: m.announcement_warning, tone: 'warning' },
	3: { label: m.announcement_critical, tone: 'error' },
};

const STORAGE_KEY = 'reseam.seenAnnouncement';

// Nothing counts as new until the browser has read what this visitor saw, so prerendered pages show no dot.
let seen = $state(Number.POSITIVE_INFINITY);

/** The newest announcement this visitor has seen, kept in this browser. */
export const reading = {
	restore() {
		seen = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
	},
	isNew: (id: number) => id > seen,
	markSeen(id: number) {
		if (id <= seen) return;
		seen = id;
		localStorage.setItem(STORAGE_KEY, String(id));
	},
};
