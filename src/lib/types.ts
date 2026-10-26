export type BundleInfo = {
	name: string;
	author: string;
	description: string;
	homepage?: string;
	public_key?: string;
};

export type PatchCompatibility =
	| { kind: 'universal' }
	| {
			kind: 'packages';
			packages: Array<{ package: string; versions: string[] }>;
	  };

export type PatchOptionValue =
	| { type: 'string'; value: string }
	| { type: 'bool'; value: boolean }
	| { type: 'int'; value: number }
	| { type: 'float'; value: number }
	| { type: 'string_list'; value: string[] }
	| { type: 'path'; value: string };

export type PatchOption = {
	key: string;
	title: string;
	description: string;
	option_type: 'string' | 'bool' | 'int' | 'float' | 'string_list' | 'path';
	default_value: PatchOptionValue | null;
	valid_values: string[] | null;
	required: boolean;
};

export type PatchInfo = {
	bundle: string;
	id: string;
	name: string;
	hidden: boolean;
	description: string;
	enabled_by_default: boolean;
	dependencies: string[];
	compatibility: PatchCompatibility;
	options: PatchOption[];
};

export type ReleaseInfo = {
	version: string;
	created_at: string;
	description: string;
	download_url: string;
	prerelease: boolean;
	patches?: PatchInfo[];
};

export type ReleaseResponse = {
	bundle: BundleInfo;
	release: ReleaseInfo;
};

export type ReleaseIndex = {
	format_version?: number;
	bundle: BundleInfo;
	releases: ReleaseInfo[];
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
	hidden: boolean;
	created_at: string;
};
