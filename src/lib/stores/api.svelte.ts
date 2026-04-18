import {
	fetchAnnouncement,
	fetchAnnouncements,
	fetchLatestManager,
	fetchLatestPatches,
	type ApiResult,
} from '$lib/api';
import type { Announcement, ReleaseResponse } from '$lib/types';
import { settings } from './settings.svelte';

type Resource<T> = {
	data: T | null;
	loading: boolean;
	error: string;
	loadedFrom: string;
};

function emptyResource<T>(): Resource<T> {
	return { data: null, loading: false, error: '', loadedFrom: '' };
}

function createApiStore() {
	let patches = $state<Resource<ReleaseResponse>>(emptyResource());
	let manager = $state<Resource<ReleaseResponse>>(emptyResource());
	let announcements = $state<Resource<Announcement[]>>(emptyResource());
	let announcementsTag = $state('');
	let announcement = $state<Resource<Announcement>>(emptyResource());

	let patchesPromise: Promise<ApiResult<ReleaseResponse>> | null = null;
	let managerPromise: Promise<ApiResult<ReleaseResponse>> | null = null;
	let announcementsPromise: Promise<ApiResult<Announcement[]>> | null = null;
	let announcementPromise: Promise<ApiResult<Announcement>> | null = null;

	function apply<T>(current: Resource<T>, url: string, result: ApiResult<T>): Resource<T> {
		if (result.ok) return { data: result.data, loading: false, error: '', loadedFrom: url };
		return { data: null, loading: false, error: result.message, loadedFrom: url };
	}

	async function loadPatches(force = false) {
		const url = settings.apiUrl;
		if (!force && patches.data && patches.loadedFrom === url) return;
		if (patchesPromise && patches.loadedFrom === url) {
			await patchesPromise;
			return;
		}
		patches = { ...patches, loading: true, error: '', loadedFrom: url };
		patchesPromise = fetchLatestPatches(url).finally(() => {
			patchesPromise = null;
		});
		const result = await patchesPromise;
		if (settings.apiUrl !== url) return;
		patches = apply(patches, url, result);
	}

	async function loadManager(force = false) {
		const url = settings.apiUrl;
		if (!force && manager.data && manager.loadedFrom === url) return;
		if (managerPromise && manager.loadedFrom === url) {
			await managerPromise;
			return;
		}
		manager = { ...manager, loading: true, error: '', loadedFrom: url };
		managerPromise = fetchLatestManager(url).finally(() => {
			managerPromise = null;
		});
		const result = await managerPromise;
		if (settings.apiUrl !== url) return;
		manager = apply(manager, url, result);
	}

	async function loadAnnouncements(tag: string = announcementsTag, force = false) {
		const url = settings.apiUrl;
		const trimmed = tag.trim();
		announcementsTag = trimmed;
		const stamp = `${url}|${trimmed}`;
		if (!force && announcements.data && announcements.loadedFrom === stamp) return;
		if (announcementsPromise && announcements.loadedFrom === stamp) {
			await announcementsPromise;
			return;
		}
		announcements = { ...announcements, loading: true, error: '', loadedFrom: stamp };
		announcementsPromise = fetchAnnouncements(url, trimmed).finally(() => {
			announcementsPromise = null;
		});
		const result = await announcementsPromise;
		if (`${settings.apiUrl}|${announcementsTag}` !== stamp) return;
		announcements = apply(announcements, stamp, result);
	}

	async function loadAnnouncement(id: number, force = false) {
		const url = settings.apiUrl;
		const stamp = `${url}|${id}`;
		if (!force && announcement.data?.id === id && announcement.loadedFrom === stamp) return;
		if (announcementPromise && announcement.loadedFrom === stamp) {
			await announcementPromise;
			return;
		}
		announcement = { data: null, loading: true, error: '', loadedFrom: stamp };
		announcementPromise = fetchAnnouncement(url, id).finally(() => {
			announcementPromise = null;
		});
		const result = await announcementPromise;
		if (settings.apiUrl !== url) return;
		announcement = apply(announcement, stamp, result);
	}

	function reload() {
		patches = emptyResource();
		manager = emptyResource();
		announcements = emptyResource();
		announcement = emptyResource();
	}

	return {
		get patches() {
			return patches;
		},
		get manager() {
			return manager;
		},
		get announcements() {
			return announcements;
		},
		get announcementsTag() {
			return announcementsTag;
		},
		get announcement() {
			return announcement;
		},
		loadPatches,
		loadManager,
		loadAnnouncements,
		loadAnnouncement,
		reload,
	};
}

export const api = createApiStore();
