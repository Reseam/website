import Discord from '#lib/components/brand/Discord.svelte';
import Reddit from '#lib/components/brand/Reddit.svelte';
import Telegram from '#lib/components/brand/Telegram.svelte';
import X from '#lib/components/brand/X.svelte';

export const SITE_URL = 'https://reseam.app';
export const SOURCE_URL = 'https://git.reseam.app';
export const MIRROR_URL = 'https://github.com/Reseam';
export const DISCORD_URL = `${SITE_URL}/discord`;
export const SPONSORS_URL = 'https://github.com/sponsors/Reseam';

export const SOCIALS = [
	{ name: 'Discord', href: DISCORD_URL, icon: Discord },
	{ name: 'Reddit', href: `${SITE_URL}/reddit`, icon: Reddit },
	{ name: 'Telegram', href: `${SITE_URL}/telegram`, icon: Telegram },
	{ name: 'X', href: `${SITE_URL}/x`, icon: X },
] as const;

export type ImageAsset = { src: string; alt: string; width: number; height: number };

export const NAV = [
	{ label: 'Patches', href: '/patches/' },
	{ label: 'Patch online', href: '/patch/' },
	{ label: 'Download', href: '/download/' },
	{ label: 'Docs', href: '/docs/' },
] as const;
