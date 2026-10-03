import { EngineError, type Problem } from '@reseam/browser';

type PatchName = (reference: string) => string;

export function describe(error: unknown, patchName: PatchName): string {
	if (!(error instanceof EngineError))
		return error instanceof Error ? error.message : String(error);
	return explain(error.problem, patchName) ?? error.message;
}

export function explain(problem: Problem, patchName: PatchName): string | undefined {
	switch (problem.type) {
		case 'unreadable_apk':
			return 'This app file could not be read. Download it again and retry.';
		case 'unreadable_bundle':
			return 'A patch bundle could not be read. Download it again and retry.';
		case 'untrusted_bundle':
			return 'A patch bundle is signed by a signer you have not trusted.';
		case 'bundle_too_old':
			return `${problem.bundle} is too old for this patcher. Use a newer bundle.`;
		case 'engine_too_old':
			return `${problem.bundle} needs a newer patcher. Reload the page to update.`;
		case 'patches_failed':
			return `${problem.patches.map(patchName).join(', ')} could not be applied.`;
		case 'incompatible_package':
			return `These patches are not made for ${problem.package}.`;
		case 'missing_package':
			return 'This file is not a valid app.';
		case 'option_type':
		case 'option_choice':
			return `The value for ${problem.key} is not valid.`;
		default:
			return undefined;
	}
}
