import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	API_URL: {
		public: true,
		static: true,
		description: 'Reseam API the site is built against and visitors start from.',
		schema: (value) => (value || 'https://api.reseam.app').replace(/\/+$/, ''),
	},
});
