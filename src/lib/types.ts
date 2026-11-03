import type { PublishedRelease, Publisher } from '@reseam/browser';

export type ReleaseResponse = {
	bundle: Publisher;
	release: PublishedRelease;
};

export type AppInfo = { name: string; icon?: string };

export type AnnouncementLevel = 0 | 1 | 2 | 3;

export type Announcement = {
	id: number;
	author: string | null;
	title: string;
	content: string | null;
	level: AnnouncementLevel;
	created_at: string;
	archived_at: string | null;
	tags: string[];
};

export type RequestStatus = 'open' | 'planned' | 'shipped' | 'declined' | 'duplicate' | 'hidden';

export type PatchRequest = {
	id: number;
	app: string | null;
	title: string;
	body: string | null;
	status: RequestStatus;
	shipped_in: string | null;
	duplicate_of: number | null;
	votes: number;
	comments: number;
	created_at: string;
};

export type RequestComment = {
	id: number;
	request_id: number;
	body: string;
	team: boolean;
	requester: boolean;
	hidden: boolean;
	created_at: string;
};
