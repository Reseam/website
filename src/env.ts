import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	API_URL: {
		public: true,
		static: true,
		description: 'Reseam API the site is built against and visitors start from.',
		schema: (value) => (value || 'https://api.reseam.app').replace(/\/+$/, ''),
	},
	TURNSTILE_SITE_KEY: {
		public: true,
		static: true,
		description:
			'Cloudflare Turnstile site key for posting and voting on requests. Empty makes requests read-only.',
		schema: (value) => value ?? '',
	},
	DOWNLOADER_URL: {
		public: true,
		static: true,
		description: 'Reseam Downloader that names apps and gives their icons.',
		schema: (value) => (value || 'https://dl.reseam.app/v1').replace(/\/+$/, ''),
	},
});
