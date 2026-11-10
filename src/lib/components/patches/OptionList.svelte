<script lang="ts">
	import type { OptionDeclaration, OptionText } from '@reseam/browser';
	import { m } from '#lib/paraglide/messages.js';

	let { options, texts }: { options: OptionDeclaration[]; texts: OptionText[] } = $props();

	const types: Record<OptionDeclaration['option_type'], () => string> = {
		string: m.option_type_string,
		bool: m.option_type_bool,
		int: m.option_type_int,
		float: m.option_type_float,
		string_list: m.option_type_string_list,
		path: m.option_type_path,
	};
	const textOf = (key: string) => texts.find((text) => text.key === key);
	const show = (value: unknown) => (Array.isArray(value) ? value.join(', ') : String(value));
</script>

<dl class="mt-3 grid gap-3 rounded-md bg-surface-container px-4 py-3.5">
	{#each options as option (option.key)}
		{@const text = textOf(option.key)}
		<div class="grid gap-0.5">
			<dt class="text-title-small">
				{text?.title || option.key}
				<span class="ml-1.5 text-body-small text-on-surface-variant">
					{[
						types[option.option_type](),
						option.required && m.option_required(),
						option.default_value && m.option_default({ value: show(option.default_value.value) }),
						option.valid_values?.length &&
							m.option_choices({ values: option.valid_values.join(', ') }),
					]
						.filter(Boolean)
						.join(' · ')}
				</span>
			</dt>
			{#if text?.description}<dd class="text-body-medium text-on-surface-variant">
					{text.description}
				</dd>{/if}
		</div>
	{/each}
</dl>
