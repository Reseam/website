import { patches } from '#lib/server/api.ts';

export async function load() {
	return { release: await patches() };
}
