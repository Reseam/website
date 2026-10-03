import { docs } from '#lib/server/docs.ts';

export function load() {
	return { groups: docs.groups };
}
