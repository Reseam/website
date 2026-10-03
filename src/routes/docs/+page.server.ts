import { docs } from '#lib/server/docs.ts';

export function load() {
	return { hub: docs.hub };
}
