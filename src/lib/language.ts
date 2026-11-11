import {
	baseLocale,
	getLocale,
	isLocale,
	locales,
	setLocale,
	type Locale,
} from '#lib/paraglide/runtime.js';

const STORAGE_KEY = 'reseam.language';

const language = (tag: string) => tag.toLowerCase().split('-')[0];

/** The first of the browser's languages the site has, by exact tag and then by language alone. */
function browserLocale(): Locale | undefined {
	for (const tag of navigator.languages) {
		const match =
			locales.find((locale) => locale.toLowerCase() === tag.toLowerCase()) ??
			locales.find((locale) => language(locale) === language(tag));
		if (match) return match;
	}
}

export function chooseLanguage(locale: Locale) {
	localStorage.setItem(STORAGE_KEY, locale);
	setLocale(locale);
}

/**
 * An address without a language shows the visitor's own: their last pick, else the browser's.
 * An address that names a language is left alone, so shared links open as shared.
 */
export function followPreferredLanguage() {
	if (getLocale() !== baseLocale) return;
	const picked = localStorage.getItem(STORAGE_KEY);
	const preferred = isLocale(picked) ? picked : browserLocale();
	if (preferred && preferred !== baseLocale) setLocale(preferred);
}
