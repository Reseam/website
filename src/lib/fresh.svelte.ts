import { settings } from '#lib/settings.svelte.ts';

/**
 * Prerendered data that the browser refreshes from the configured API,
 * so pages render instantly and still reflect releases since the last build.
 */
export function fresh<T>(initial: () => T, load: (apiUrl: string) => Promise<T>) {
	let value = $state.raw(initial());
	let failed = $state(false);

	$effect(() => {
		const apiUrl = settings.apiUrl;
		let current = true;
		load(apiUrl).then(
			(next) => {
				if (!current) return;
				value = next;
				failed = false;
			},
			() => {
				if (current) failed = true;
			}
		);
		return () => {
			current = false;
		};
	});

	return {
		get value() {
			return value;
		},
		get failed() {
			return failed;
		},
	};
}
