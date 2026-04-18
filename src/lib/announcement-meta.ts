import { Info, Sparkles, CircleAlert, TriangleAlert } from 'lucide-svelte';
import type { AnnouncementLevel } from '$lib/types';

export type LevelMeta = {
	label: string;
	icon: typeof Info;
	color: string;
	dotColor: string;
};

const META: Record<AnnouncementLevel, LevelMeta> = {
	0: {
		label: 'News',
		icon: Sparkles,
		color: 'text-primary bg-primary/10',
		dotColor: 'bg-primary',
	},
	1: {
		label: 'Notice',
		icon: Info,
		color: 'text-sky-400 bg-sky-400/10',
		dotColor: 'bg-sky-400',
	},
	2: {
		label: 'Warning',
		icon: TriangleAlert,
		color: 'text-amber-500 bg-amber-500/10',
		dotColor: 'bg-amber-500',
	},
	3: {
		label: 'Critical',
		icon: CircleAlert,
		color: 'text-destructive bg-destructive/10',
		dotColor: 'bg-destructive',
	},
};

export function levelMeta(level: AnnouncementLevel): LevelMeta {
	return META[level] ?? META[1];
}
