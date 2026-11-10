import type {
	EngineTools,
	MountedFile,
	OptionDeclaration,
	OptionProblem,
	OptionValue,
} from '@reseam/browser';
import { m } from '#lib/paraglide/messages.js';

export type OptionDraft =
	| { kind: 'text'; value: string }
	| { kind: 'toggle'; value: boolean }
	| { kind: 'path'; files: File[]; folder: boolean };

export function initialDraft(tools: EngineTools, option: OptionDeclaration): OptionDraft {
	const value = option.default_value;
	switch (option.option_type) {
		case 'bool':
			return { kind: 'toggle', value: value?.value === true };
		case 'path':
			return { kind: 'path', files: [], folder: false };
		default:
			return { kind: 'text', value: value ? tools.optionText(value) : '' };
	}
}

/** Why typed text is not a value of the option; the engine reads it as the CLI and Manager do. */
export function draftProblem(
	tools: EngineTools,
	option: OptionDeclaration,
	draft: OptionDraft
): OptionProblem | null {
	if (draft.kind !== 'text' || draft.value.trim() === '') return null;
	const parsed = tools.parseOption(option, draft.value);
	return parsed.kind === 'problem' ? parsed.problem : null;
}

/** Null when the patch's default applies, or the text is not a value yet. */
export function draftValue(
	tools: EngineTools,
	option: OptionDeclaration,
	draft: OptionDraft,
	directory: string
): { value: OptionValue; uploads: MountedFile[] } | null {
	switch (draft.kind) {
		case 'toggle':
			return draft.value === (option.default_value?.value === true)
				? null
				: { value: { type: 'bool', value: draft.value }, uploads: [] };
		case 'path': {
			if (draft.files.length === 0) return null;
			if (!draft.folder) {
				const name = `${directory}/${draft.files[0].name}`;
				return {
					value: { type: 'path', value: `/input/${name}` },
					uploads: [{ name, file: draft.files[0] }],
				};
			}
			const uploads = draft.files.map((file) => ({
				name: `${directory}/${file.webkitRelativePath.split('/').slice(1).join('/')}`,
				file,
			}));
			return { value: { type: 'path', value: `/input/${directory}` }, uploads };
		}
		case 'text': {
			if (draft.value.trim() === '') return null;
			const parsed = tools.parseOption(option, draft.value);
			return parsed.kind === 'value' ? { value: parsed.value, uploads: [] } : null;
		}
	}
}

export function problemText(problem: OptionProblem): string {
	switch (problem.kind) {
		case 'missing':
			return m.option_problem_missing();
		case 'not_a_bool':
			return m.option_problem_not_a_bool();
		case 'not_an_integer':
			return m.option_problem_not_an_integer();
		case 'not_a_number':
			return m.option_problem_not_a_number();
		case 'not_allowed':
			return m.option_problem_not_allowed({ values: problem.allowed.join(', ') });
		case 'undeclared':
		case 'wrong_type':
			return m.option_problem_undeclared();
	}
}
