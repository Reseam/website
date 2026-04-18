export type BundleInfo = {
	name: string;
	author: string;
	description: string;
	homepage?: string;
	public_key?: string;
};

export type ReleaseInfo = {
	version: string;
	created_at: string;
	description: string;
	download_url: string;
	prerelease: boolean;
};

export type ReleaseResponse = {
	bundle: BundleInfo;
	release: ReleaseInfo;
};

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
