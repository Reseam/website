import type { MountedFile, OptionDeclaration, OptionValue } from '@reseam/browser';

export type OptionDraft =
	| { kind: 'text'; value: string }
	| { kind: 'toggle'; value: boolean }
	| { kind: 'path'; files: File[]; folder: boolean };

const LONG_MIN = -9223372036854775808n;
const LONG_MAX = 9223372036854775807n;

export function initialDraft(option: OptionDeclaration): OptionDraft {
	const value = option.default_value?.value;
	switch (option.option_type) {
		case 'bool':
			return { kind: 'toggle', value: value === true };
		case 'path':
			return { kind: 'path', files: [], folder: false };
		case 'string_list':
			return { kind: 'text', value: Array.isArray(value) ? value.join('\n') : '' };
		default:
			return { kind: 'text', value: value === undefined ? '' : String(value) };
	}
}

export function draftError(option: OptionDeclaration, draft: OptionDraft): string | null {
	if (draft.kind === 'toggle') return null;
	const empty = draft.kind === 'path' ? draft.files.length === 0 : draft.value.trim() === '';
	if (empty) return option.required && option.default_value === null ? 'Required' : null;
	if (draft.kind === 'path') return null;
	if (option.option_type === 'int') {
		if (!/^-?\d+$/.test(draft.value.trim())) return 'Enter a whole number';
		const value = BigInt(draft.value.trim());
		if (value < LONG_MIN || value > LONG_MAX) return 'Number is too large';
	}
	if (option.option_type === 'float' && !Number.isFinite(Number(draft.value))) {
		return 'Enter a number';
	}
	if (option.valid_values?.length && !option.valid_values.includes(draft.value)) {
		return `Choose one of ${option.valid_values.join(', ')}`;
	}
	return null;
}

/** Null when the patch's default applies. */
export function draftValue(
	option: OptionDeclaration,
	draft: OptionDraft,
	directory: string
): { value: OptionValue; uploads: MountedFile[] } | null {
	const type = option.option_type;
	switch (draft.kind) {
		case 'toggle':
			return draft.value === (option.default_value?.value === true)
				? null
				: { value: { type, value: draft.value }, uploads: [] };
		case 'path': {
			if (draft.files.length === 0) return null;
			if (!draft.folder) {
				const name = `${directory}/${draft.files[0].name}`;
				return {
					value: { type, value: `/input/${name}` },
					uploads: [{ name, file: draft.files[0] }],
				};
			}
			const uploads = draft.files.map((file) => ({
				name: `${directory}/${file.webkitRelativePath.split('/').slice(1).join('/')}`,
				file,
			}));
			return { value: { type, value: `/input/${directory}` }, uploads };
		}
		case 'text': {
			const text = draft.value.trim();
			if (text === '') return null;
			const value =
				type === 'int'
					? BigInt(text)
					: type === 'float'
						? Number(text)
						: type === 'string_list'
							? draft.value.split('\n').filter((line) => line.trim() !== '')
							: draft.value;
			return { value: { type, value }, uploads: [] };
		}
	}
}
