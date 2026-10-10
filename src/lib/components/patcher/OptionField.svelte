<script lang="ts">
	import FileIcon from '@lucide/svelte/icons/file';
	import Folder from '@lucide/svelte/icons/folder';
	import X from '@lucide/svelte/icons/x';
	import type { OptionDeclaration } from '@reseam/browser';
	import { Label } from 'bits-ui';
	import Checkbox from '#lib/components/ui/Checkbox.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import { buttonClass } from '#lib/components/ui/button.ts';
	import type { OptionDraft } from '#lib/patcher/options.ts';

	let {
		option,
		draft,
		error,
		id,
		onchange,
	}: {
		option: OptionDeclaration;
		draft: OptionDraft;
		error: string | null;
		id: string;
		onchange: (draft: OptionDraft) => void;
	} = $props();

	const title = $derived(option.title || option.key);
	const describedby = $derived(
		[option.description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') ||
			undefined
	);

	function picked(input: HTMLInputElement, folder: boolean) {
		const files = [...(input.files ?? [])];
		input.value = '';
		if (files.length > 0) onchange({ kind: 'path', files, folder });
	}
</script>

<div class="grid gap-1.5 text-body-medium">
	{#if draft.kind === 'toggle'}
		<div class="flex items-start gap-2.5">
			<Checkbox
				{id}
				checked={draft.value}
				aria-describedby={describedby}
				onCheckedChange={(value) => onchange({ kind: 'toggle', value })}
			/>
			<Label.Root for={id} class="text-label-large">{title}</Label.Root>
		</div>
	{:else}
		<Label.Root for={id} class="text-label-large">
			{title}
			{#if option.required && option.default_value === null}<span
					class="text-body-medium text-on-surface-variant">· Required</span
				>{/if}
		</Label.Root>
		{#if draft.kind === 'path'}
			<div class="flex flex-wrap items-center gap-2">
				<label class={buttonClass('outline', 'sm')}>
					<FileIcon size={14} /> Choose file
					<input
						{id}
						type="file"
						class="sr-only"
						aria-describedby={describedby}
						onchange={(event) => picked(event.currentTarget, false)}
					/>
				</label>
				<label class={buttonClass('outline', 'sm')}>
					<Folder size={14} /> Choose folder
					<input
						type="file"
						webkitdirectory
						class="sr-only"
						onchange={(event) => picked(event.currentTarget, true)}
					/>
				</label>
				{#if draft.files.length > 0}
					<span class="inline-flex min-w-0 items-center gap-1 text-on-surface-variant">
						<span class="truncate">
							{draft.folder
								? `${draft.files[0].webkitRelativePath.split('/')[0]} (${draft.files.length} files)`
								: draft.files[0].name}
						</span>
						<button
							type="button"
							aria-label="Clear {title}"
							onclick={() => onchange({ kind: 'path', files: [], folder: false })}
							class="rounded-full p-1 hover:bg-surface-container hover:text-on-surface"
						>
							<X size={14} />
						</button>
					</span>
				{/if}
			</div>
		{:else if option.valid_values?.length}
			<Select
				{id}
				value={draft.value}
				items={option.valid_values}
				invalid={!!error}
				{describedby}
				onchange={(value) => onchange({ kind: 'text', value })}
			/>
		{:else if option.option_type === 'string_list'}
			<textarea
				{id}
				rows="3"
				value={draft.value}
				placeholder="One per line"
				aria-describedby={describedby}
				aria-invalid={error ? true : undefined}
				oninput={(event) => onchange({ kind: 'text', value: event.currentTarget.value })}
				class="field"></textarea>
		{:else}
			<input
				{id}
				type="text"
				value={draft.value}
				inputmode={option.option_type === 'int'
					? 'numeric'
					: option.option_type === 'float'
						? 'decimal'
						: undefined}
				aria-describedby={describedby}
				aria-invalid={error ? true : undefined}
				oninput={(event) => onchange({ kind: 'text', value: event.currentTarget.value })}
				class="field"
			/>
		{/if}
	{/if}
	{#if option.description}
		<p
			id="{id}-description"
			class={['text-on-surface-variant', draft.kind === 'toggle' && 'pl-7.5']}
		>
			{option.description}
		</p>
	{/if}
	{#if error}<p id="{id}-error" class="text-error">{error}</p>{/if}
</div>
