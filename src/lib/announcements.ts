import type { Announcement } from '#lib/types.ts';

export const newestFirst = (announcements: Announcement[]) =>
	announcements.toSorted((a, b) => b.created_at.localeCompare(a.created_at));
