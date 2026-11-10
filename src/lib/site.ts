import Discord from '#lib/components/brand/Discord.svelte';
import Reddit from '#lib/components/brand/Reddit.svelte';
import Telegram from '#lib/components/brand/Telegram.svelte';
import X from '#lib/components/brand/X.svelte';
import { m } from '#lib/paraglide/messages.js';

export const SITE_URL = 'https://reseam.app';
export const SOURCE_URL = 'https://git.reseam.app';
export const MIRROR_URL = 'https://github.com/Reseam';
export const SPONSORS_URL = 'https://github.com/sponsors/Reseam';

export const SOCIALS = [
	{ name: 'Discord', href: `${SITE_URL}/discord`, icon: Discord },
	{ name: 'Reddit', href: `${SITE_URL}/reddit`, icon: Reddit },
	{ name: 'Telegram', href: `${SITE_URL}/telegram`, icon: Telegram },
	{ name: 'X', href: `${SITE_URL}/x`, icon: X },
] as const;

export type ImageAsset = { src: string; alt: string; width: number; height: number };

export const NAV = [
	{ label: m.nav_patches, href: '/patches/' },
	{ label: m.nav_patch_online, href: '/patch/' },
	{ label: m.nav_download, href: '/download/' },
	{ label: m.nav_requests, href: '/requests/' },
	{ label: m.nav_docs, href: '/docs/' },
] as const;
