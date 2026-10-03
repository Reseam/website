import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import type { Connect } from 'vite';
import { defineConfig, type Plugin } from 'vite';

// Patching needs SharedArrayBuffer, so the patcher page and its workers are cross-origin isolated.
// nginx.conf sends the same headers in production; the rest of the site stays unisolated.
const isolate: Connect.NextHandleFunction = (request, response, next) => {
	if (request.url?.startsWith('/patch/') || request.headers['sec-fetch-dest'] === 'worker') {
		response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
		response.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
	}
	next();
};

const crossOriginIsolation: Plugin = {
	name: 'cross-origin-isolation',
	configureServer: (server) => void server.middlewares.use(isolate),
	configurePreviewServer: (server) => void server.middlewares.use(isolate),
};

export default defineConfig({
	plugins: [
		crossOriginIsolation,
		tailwindcss(),
		sveltekit({
			adapter: adapter({ strict: true, fallback: '404.html' }),
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true,
			},
		}),
	],
	// CheerpJ loads through importScripts, which needs classic workers.
	worker: { format: 'iife' },
	// The package ships TypeScript sources with worker URLs relative to them.
	optimizeDeps: { exclude: ['@reseam/browser'] },
	ssr: { noExternal: ['@reseam/browser'] },
});
