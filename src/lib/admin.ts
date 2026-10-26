import type { Announcement, AnnouncementLevel, PatchRequest, RequestStatus } from '#lib/types.ts';

export type RequestChanges = {
	status?: RequestStatus;
	shipped_in?: string | null;
	duplicate_of?: number | null;
};

export type AnnouncementDraft = {
	title: string;
	content?: string;
	level: AnnouncementLevel;
	tags: string[];
};

export function adminApi(apiUrl: string, token: string) {
	async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
		const response = await fetch(`${apiUrl}${path}`, {
			...init,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		});
		const body = await response.json();
		if (!response.ok) throw new Error(body.error ?? `${response.status}`);
		return body as T;
	}

	return {
		requests: () => call<PatchRequest[]>('/v1/requests?sort=new'),
		updateRequest: (id: number, changes: RequestChanges) =>
			call<PatchRequest>(`/v1/requests/${id}`, { method: 'PATCH', body: JSON.stringify(changes) }),
		deleteRequest: (id: number, author: boolean) =>
			call<{ ok: boolean }>(`/v1/requests/${id}${author ? '?author=true' : ''}`, {
				method: 'DELETE',
			}),
		announcements: () => call<Announcement[]>('/v1/announcements?archived=true'),
		postAnnouncement: (draft: AnnouncementDraft) =>
			call<Announcement>('/v1/announcements', { method: 'POST', body: JSON.stringify(draft) }),
		archiveAnnouncement: (id: number, archived: boolean) =>
			call<Announcement>(`/v1/announcements/${id}`, {
				method: 'PATCH',
				body: JSON.stringify({ archived_at: archived ? new Date().toISOString() : null }),
			}),
		deleteAnnouncement: (id: number) =>
			call<{ ok: boolean }>(`/v1/announcements/${id}`, { method: 'DELETE' }),
	};
}

export type AdminApi = ReturnType<typeof adminApi>;
