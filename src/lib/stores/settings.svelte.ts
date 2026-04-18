import {
	DEFAULT_API_URL,
	API_URL_OVERRIDE_KEY,
	clearApiUrlOverride,
	normalizeApiUrl,
	readApiUrlOverride,
	saveApiUrlOverride,
} from '$lib/api-url';

function createSettingsStore() {
	let apiUrl = $state(DEFAULT_API_URL);
	let loaded = $state(false);

	function load() {
		if (loaded) return;
		if (typeof localStorage === 'undefined') {
			loaded = true;
			return;
		}
		const override = readApiUrlOverride();
		if (override) apiUrl = override;
		loaded = true;
	}

	function setApiUrl(value: string) {
		const trimmed = value.trim();
		if (!trimmed) {
			apiUrl = clearApiUrlOverride();
			return apiUrl;
		}
		apiUrl = saveApiUrlOverride(trimmed);
		return apiUrl;
	}

	function resetApiUrl() {
		apiUrl = clearApiUrlOverride();
		return apiUrl;
	}

	function isOverridden() {
		return normalizeApiUrl(apiUrl) !== DEFAULT_API_URL;
	}

	load();

	return {
		get apiUrl() {
			return apiUrl;
		},
		get defaultApiUrl() {
			return DEFAULT_API_URL;
		},
		get loaded() {
			return loaded;
		},
		get overridden() {
			return isOverridden();
		},
		get storageKey() {
			return API_URL_OVERRIDE_KEY;
		},
		load,
		setApiUrl,
		resetApiUrl,
	};
}

export const settings = createSettingsStore();
