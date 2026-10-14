export const SITE_URL = 'https://reseam.app';
export const SOURCE_URL = 'https://git.reseam.app';
export const DISCORD_URL = 'https://discord.gg/R6R6FF6K6x';

export type ImageAsset = { src: string; alt: string; width: number; height: number };

export const NAV = [
	{ label: 'Patches', href: '/patches/' },
	{ label: 'Patch online', href: '/patch/' },
	{ label: 'Download', href: '/download/' },
	{ label: 'Docs', href: '/docs/' },
] as const;
