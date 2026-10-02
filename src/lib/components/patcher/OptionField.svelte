<script lang="ts">
	import { File as FileIcon, Folder, X } from 'lucide-svelte';
	import type { OptionDeclaration } from '@reseam/browser';
	import type { OptionDraft } from '$lib/patcher/options';

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

	let fileInput = $state<HTMLInputElement>();
	let folderInput = $state<HTMLInputElement>();

	const describedBy = $derived(
		[option.description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') ||
			undefined
	);
	const control =
		'w-full rounded-[0.75rem] border border-border bg-background px-3 py-2 text-sm transition-colors focus:border-primary aria-invalid:border-destructive';

	function pickFiles(input: HTMLInputElement, folder: boolean) {
		const files = [...(input.files ?? [])];
		input.value = '';
		if (files.length > 0) onchange({ kind: 'path', files, folder });
	}
</script>

<div class="text-sm">
	{#if draft.kind === 'toggle'}
		<label class="flex cursor-pointer items-start gap-2.5">
			<input
				{id}
				type="checkbox"
				checked={draft.value}
				aria-describedby={describedBy}
				onchange={(event) => onchange({ kind: 'toggle', value: event.currentTarget.checked })}
				class="mt-0.5 size-4 shrink-0 accent-primary"
			/>
			<span class="font-medium">{option.title || option.key}</span>
		</label>
	{:else}
		<label for={id} class="mb-1.5 block font-medium">
			{option.title || option.key}
			{#if option.required && option.default_value === null}
				<span class="font-normal text-muted-foreground">· Required</span>
			{/if}
		</label>
		{#if draft.kind === 'path'}
			<div class="flex flex-wrap items-center gap-2">
				<button
					{id}
					type="button"
					aria-describedby={describedBy}
					onclick={() => fileInput?.click()}
					class="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 hover:bg-muted"
				>
					<FileIcon size={14} /> Choose file
				</button>
				<button
					type="button"
					onclick={() => folderInput?.click()}
					class="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 hover:bg-muted"
				>
					<Folder size={14} /> Choose folder
				</button>
				{#if draft.files.length > 0}
					<span class="inline-flex min-w-0 items-center gap-1 text-muted-foreground">
						<span class="truncate">
							{draft.folder
								? `${draft.files[0].webkitRelativePath.split('/')[0]} (${draft.files.length} files)`
								: draft.files[0].name}
						</span>
						<button
							type="button"
							aria-label="Clear {option.title || option.key}"
							onclick={() => onchange({ kind: 'path', files: [], folder: false })}
							class="rounded-full p-1 hover:bg-muted hover:text-foreground"
						>
							<X size={14} />
						</button>
					</span>
				{/if}
			</div>
			<input
				bind:this={fileInput}
				type="file"
				class="sr-only"
				tabindex="-1"
				aria-hidden="true"
				onchange={() => pickFiles(fileInput!, false)}
			/>
			<input
				bind:this={folderInput}
				type="file"
				webkitdirectory
				class="sr-only"
				tabindex="-1"
				aria-hidden="true"
				onchange={() => pickFiles(folderInput!, true)}
			/>
		{:else if option.valid_values?.length}
			<select
				{id}
				value={draft.value}
				aria-describedby={describedBy}
				aria-invalid={error ? true : undefined}
				onchange={(event) => onchange({ kind: 'text', value: event.currentTarget.value })}
				class={control}
			>
				{#if option.default_value === null}<option value="">Choose…</option>{/if}
				{#each option.valid_values as value (value)}
					<option {value}>{value}</option>
				{/each}
			</select>
		{:else if option.option_type === 'string_list'}
			<textarea
				{id}
				rows="3"
				value={draft.value}
				placeholder="One per line"
				aria-describedby={describedBy}
				aria-invalid={error ? true : undefined}
				oninput={(event) => onchange({ kind: 'text', value: event.currentTarget.value })}
				class={control}
			></textarea>
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
				aria-describedby={describedBy}
				aria-invalid={error ? true : undefined}
				oninput={(event) => onchange({ kind: 'text', value: event.currentTarget.value })}
				class={control}
			/>
		{/if}
	{/if}
	{#if option.description}
		<p
			id="{id}-description"
			class="mt-1 text-muted-foreground {draft.kind === 'toggle' ? 'pl-6.5' : ''}"
		>
			{option.description}
		</p>
	{/if}
	{#if error}
		<p id="{id}-error" class="mt-1 text-destructive">{error}</p>
	{/if}
</div>
