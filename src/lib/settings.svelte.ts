import { env } from '$env/dynamic/public';

export const DEFAULT_API_URL = (env.PUBLIC_API_URL || 'https://api.reseam.app').replace(/\/+$/, '');
const STORAGE_KEY = 'reseam.apiUrl';

let apiUrl = $state(
	typeof localStorage === 'undefined'
		? DEFAULT_API_URL
		: (localStorage.getItem(STORAGE_KEY) ?? DEFAULT_API_URL)
);

export const settings = {
	get apiUrl() {
		return apiUrl;
	},
	setApiUrl(value: string): string | undefined {
		const trimmed = value.trim().replace(/\/+$/, '');
		if (!trimmed) {
			localStorage.removeItem(STORAGE_KEY);
			apiUrl = DEFAULT_API_URL;
			return;
		}
		const url = URL.canParse(trimmed) ? new URL(trimmed) : null;
		if (!url || !/^https?:$/.test(url.protocol)) {
			return 'Enter a full http or https URL, such as https://api.reseam.app';
		}
		localStorage.setItem(STORAGE_KEY, trimmed);
		apiUrl = trimmed;
	},
};
