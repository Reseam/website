import { EngineError, type Problem } from '@reseam/browser';
import { m } from '#lib/paraglide/messages.js';
import { getLocale } from '#lib/paraglide/runtime.js';

type PatchName = (reference: string) => string;

export function describe(error: unknown, patchName: PatchName): string {
	if (!(error instanceof EngineError))
		return error instanceof Error ? error.message : String(error);
	return explain(error.problem, patchName) ?? error.message;
}

export function explain(problem: Problem, patchName: PatchName): string | undefined {
	switch (problem.type) {
		case 'unreadable_apk':
			return m.problem_unreadable_apk();
		case 'unreadable_bundle':
			return m.problem_unreadable_bundle();
		case 'untrusted_bundle':
			return m.problem_untrusted_bundle();
		case 'bundle_too_old':
			return m.problem_bundle_too_old({ bundle: problem.bundle });
		case 'engine_too_old':
			return m.problem_engine_too_old({ bundle: problem.bundle });
		case 'patches_failed':
			return m.problem_patches_failed({
				patches: new Intl.ListFormat(getLocale()).format(problem.patches.map(patchName)),
			});
		case 'keystore_locked':
			return m.problem_keystore_locked();
		case 'keystore_empty':
			return m.problem_keystore_empty();
		case 'unsupported_signing_key':
			return m.problem_unsupported_signing_key();
		default:
			return undefined;
	}
}
