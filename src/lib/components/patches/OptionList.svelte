<script lang="ts">
	import type { PatchOption } from '#lib/types.ts';

	let { options }: { options: PatchOption[] } = $props();

	const types: Record<PatchOption['option_type'], string> = {
		string: 'Text',
		bool: 'On or off',
		int: 'Whole number',
		float: 'Number',
		string_list: 'List of text',
		path: 'File',
	};
	const show = (value: unknown) => (Array.isArray(value) ? value.join(', ') : String(value));
</script>

<dl class="mt-3 grid gap-3 rounded-md bg-muted px-4 py-3.5">
	{#each options as option (option.key)}
		<div class="grid gap-0.5">
			<dt class="text-sm font-semibold">
				{option.title || option.key}
				<span class="ml-1.5 text-xs font-normal text-muted-foreground">
					{[
						types[option.option_type],
						option.required && 'required',
						option.default_value && `default ${show(option.default_value.value)}`,
						option.valid_values?.length && `choices ${option.valid_values.join(', ')}`,
					]
						.filter(Boolean)
						.join(' · ')}
				</span>
			</dt>
			{#if option.description}<dd class="text-sm text-muted-foreground">
					{option.description}
				</dd>{/if}
		</div>
	{/each}
</dl>
