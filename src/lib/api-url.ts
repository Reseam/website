import { env } from '$env/dynamic/public';

export const DEFAULT_API_URL = normalizeApiUrl(env.PUBLIC_API_URL || 'https://api.reseam.app');
export const API_URL_OVERRIDE_KEY = 'reseam.apiUrl';

export function normalizeApiUrl(value: string) {
	return value.trim().replace(/\/+$/, '');
}

export function readApiUrlOverride(storage: Storage = localStorage) {
	const value = storage.getItem(API_URL_OVERRIDE_KEY);
	return value ? normalizeApiUrl(value) : null;
}

export function effectiveApiUrl(storage?: Storage) {
	if (typeof localStorage === 'undefined' && !storage) return DEFAULT_API_URL;
	return readApiUrlOverride(storage ?? localStorage) ?? DEFAULT_API_URL;
}

export function saveApiUrlOverride(value: string, storage: Storage = localStorage) {
	const normalized = normalizeApiUrl(value);
	if (!normalized) {
		storage.removeItem(API_URL_OVERRIDE_KEY);
		return DEFAULT_API_URL;
	}

	const url = new URL(normalized);
	if (url.protocol !== 'http:' && url.protocol !== 'https:') {
		throw new Error('API URL must use http or https');
	}

	storage.setItem(API_URL_OVERRIDE_KEY, url.toString().replace(/\/+$/, ''));
	return readApiUrlOverride(storage) ?? DEFAULT_API_URL;
}

export function clearApiUrlOverride(storage: Storage = localStorage) {
	storage.removeItem(API_URL_OVERRIDE_KEY);
	return DEFAULT_API_URL;
}
