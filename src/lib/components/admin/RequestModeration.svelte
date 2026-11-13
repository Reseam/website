<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
	import type { AdminApi } from '#lib/admin.ts';
	import Button from '#lib/components/ui/Button.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import { PRIORITIES, STATUSES } from '#lib/requests.svelte.ts';
	import type { PatchRequest, RequestPriority, RequestStatus } from '#lib/types.ts';

	let {
		request,
		api,
		onchange,
		onremove,
	}: {
		request: PatchRequest;
		api: AdminApi;
		onchange: (request: PatchRequest) => void;
		onremove: (author: boolean) => void;
	} = $props();

	const CHOICES = [...Object.keys(STATUSES), 'hidden'] as RequestStatus[];
	const NO_PRIORITY = 'none';

	let status = $state<RequestStatus>('open');
	let priority = $state<RequestPriority | null>(null);
	let shippedIn = $state('');
	let duplicateOf = $state('');
	let error = $state('');
	let busy = $state(false);

	$effect(() => {
		status = request.status;
		priority = request.priority;
		shippedIn = request.shipped_in ?? '';
		duplicateOf = request.duplicate_of ? String(request.duplicate_of) : '';
	});

	async function run(action: () => Promise<void>) {
		error = '';
		busy = true;
		try {
			await action();
		} catch (failure) {
			error = failure instanceof Error ? failure.message : String(failure);
		} finally {
			busy = false;
		}
	}

	const save = () =>
		run(async () =>
			onchange(
				await api.updateRequest(request.id, {
					status,
					priority: status === 'open' ? priority : null,
					shipped_in: status === 'shipped' && shippedIn ? shippedIn.trim() : null,
					duplicate_of: status === 'closed' && duplicateOf ? Number(duplicateOf) : null,
				})
			)
		);

	const remove = (author: boolean) =>
		run(async () => {
			if (
				!confirm(
					author
						? 'Delete this author and everything they posted and voted?'
						: 'Delete this request?'
				)
			)
				return;
			await api.deleteRequest(request.id, author);
			onremove(author);
		});
</script>

<div class="grid gap-2">
	<div class="flex flex-wrap items-center gap-2">
		<div class="w-40">
			<Select
				id="status-{request.id}"
				value={status}
				items={CHOICES}
				labelOf={(item) =>
					item === 'hidden' ? m.status_hidden() : STATUSES[item as keyof typeof STATUSES]()}
				onchange={(next) => (status = next as RequestStatus)}
			/>
		</div>
		{#if status === 'open'}
			<div class="w-36">
				<Select
					id="priority-{request.id}"
					value={priority ?? NO_PRIORITY}
					items={[NO_PRIORITY, ...Object.keys(PRIORITIES)]}
					labelOf={(item) =>
						item === NO_PRIORITY ? 'No priority' : PRIORITIES[item as RequestPriority]()}
					onchange={(next) => (priority = next === NO_PRIORITY ? null : (next as RequestPriority))}
				/>
			</div>
		{:else if status === 'shipped'}
			<input
				bind:value={shippedIn}
				placeholder="patches@0.48.0"
				aria-label="Shipped in"
				class="field w-44"
			/>
		{:else if status === 'closed'}
			<input
				bind:value={duplicateOf}
				inputmode="numeric"
				placeholder="Duplicate of"
				aria-label="Duplicate of"
				class="field w-32"
			/>
		{/if}
		<Button size="sm" disabled={busy} onclick={save}>Save</Button>
		<Button size="sm" variant="danger" disabled={busy} onclick={() => remove(false)}>Delete</Button>
		<Button size="sm" variant="danger" disabled={busy} onclick={() => remove(true)}
			>Delete author</Button
		>
	</div>
	{#if error}<p class="text-body-medium text-error" role="alert">{error}</p>{/if}
</div>
