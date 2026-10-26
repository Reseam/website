import { announcements, managerIndex, patchesIndex } from '#lib/server/api.ts';
import { updateEntries } from '#lib/updates.ts';

export async function load() {
	return {
		entries: updateEntries(await patchesIndex(), await managerIndex(), await announcements()),
	};
}
