<script lang="ts">
	import type { AdminApi } from '#lib/admin.ts';
	import Button from '#lib/components/ui/Button.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import { STATUSES } from '#lib/requests.svelte.ts';
	import type { PatchRequest, RequestStatus } from '#lib/types.ts';

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

	let status = $state<RequestStatus>('open');
	let shippedIn = $state('');
	let duplicateOf = $state('');
	let error = $state('');
	let busy = $state(false);

	$effect(() => {
		status = request.status;
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
					shipped_in: status === 'shipped' && shippedIn ? shippedIn.trim() : null,
					duplicate_of: status === 'duplicate' && duplicateOf ? Number(duplicateOf) : null,
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
				labelOf={(item) => (item === 'hidden' ? 'Hidden' : STATUSES[item as keyof typeof STATUSES])}
				onchange={(next) => (status = next as RequestStatus)}
			/>
		</div>
		{#if status === 'shipped'}
			<input
				bind:value={shippedIn}
				placeholder="patches@0.48.0"
				aria-label="Shipped in"
				class="field w-44"
			/>
		{:else if status === 'duplicate'}
			<input
				bind:value={duplicateOf}
				inputmode="numeric"
				placeholder="Request id"
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
