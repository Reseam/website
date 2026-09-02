import { Info, Sparkles, CircleAlert, TriangleAlert } from 'lucide-svelte';
import type { AnnouncementLevel } from '$lib/types';

export const LEVELS: Record<
	AnnouncementLevel,
	{ label: string; icon: typeof Info; color: string }
> = {
	0: { label: 'News', icon: Sparkles, color: 'text-primary bg-primary/10' },
	1: { label: 'Notice', icon: Info, color: 'text-sky-400 bg-sky-400/10' },
	2: { label: 'Warning', icon: TriangleAlert, color: 'text-amber-500 bg-amber-500/10' },
	3: { label: 'Critical', icon: CircleAlert, color: 'text-destructive bg-destructive/10' },
};
