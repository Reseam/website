import type { ClientInit } from '@sveltejs/kit/hooks';
import { followPreferredLanguage } from '#lib/language.ts';

export const init: ClientInit = followPreferredLanguage;
