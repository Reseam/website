<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import { Label } from 'bits-ui';
	import Button from '#lib/components/ui/Button.svelte';
	import Callout from '#lib/components/ui/Callout.svelte';
	import Dialog from '#lib/components/ui/Dialog.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import { RequestError, type Voter } from '#lib/requests.svelte.ts';
	import type { PatchRequest } from '#lib/types.ts';
	import Turnstile from './Turnstile.svelte';

	const OTHER = 'other';

	let {
		open = $bindable(false),
		apps,
		appLabel,
		initialApp,
		voter,
		onposted,
		onvote,
	}: {
		open?: boolean;
		apps: string[];
		appLabel: (app: string) => string;
		initialApp: string | null;
		voter: Voter;
		onposted: (request: PatchRequest) => void;
		onvote: (request: PatchRequest) => void;
	} = $props();

	let app = $state(OTHER);
	let title = $state('');
	let body = $state('');
	let turnstile = $state('');
	let duplicate = $state<PatchRequest>();
	let error = $state('');
	let sending = $state(false);

	$effect(() => {
		if (!open) return;
		app = initialApp ?? OTHER;
		duplicate = undefined;
		error = '';
	});

	async function send(force: boolean) {
		error = '';
		sending = true;
		try {
			if (!voter.ready) await voter.verify(turnstile);
			const posted = await voter.submit({
				app: app === OTHER ? undefined : app,
				title: title.trim(),
				body: body.trim() || undefined,
				force,
			});
			title = body = '';
			open = false;
			onposted(posted);
		} catch (failure) {
			if (failure instanceof RequestError && failure.duplicate) duplicate = failure.duplicate;
			else error = failure instanceof Error ? failure.message : String(failure);
		} finally {
			sending = false;
		}
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		send(false);
	}

	const valid = $derived(title.trim().length >= 10 && (voter.ready || turnstile !== ''));
</script>

<Dialog
	bind:open
	size="lg"
	title="New request"
	description="Ask for a patch, a fix, or support for an app. Requests are public."
>
	{#if duplicate}
		<Callout icon={CircleAlert} title="Someone asked for this already">
			<p class="mt-1 text-on-surface-variant">“{duplicate.title}” has {duplicate.votes} votes.</p>
		</Callout>
	{:else}
		<form id="request-form" onsubmit={submit} novalidate class="grid gap-4">
			<div class="grid gap-2">
				<Label.Root for="request-app" class="text-label-large">App</Label.Root>
				<Select
					id="request-app"
					value={app}
					items={[...apps, OTHER]}
					labelOf={(item) =>
						item === OTHER ? 'Another app, or no app in particular' : appLabel(item)}
					onchange={(next) => (app = next)}
				/>
			</div>
			<div class="grid gap-2">
				<Label.Root for="request-title" class="text-label-large">What should it do?</Label.Root>
				<input
					id="request-title"
					bind:value={title}
					maxlength="100"
					placeholder="Add a sleep timer to the player"
					class="field"
				/>
				<p class="text-body-small text-on-surface-variant">At least 10 characters.</p>
			</div>
			<div class="grid gap-2">
				<Label.Root for="request-body" class="text-label-large">Details</Label.Root>
				<textarea
					id="request-body"
					bind:value={body}
					maxlength="1000"
					rows="6"
					class="field resize-y"></textarea>
			</div>
			{#if !voter.ready}
				<Turnstile
					onverified={(token) => (turnstile = token)}
					onfailed={() => (error = 'The check did not load. Try again.')}
				/>
			{/if}
		</form>
	{/if}
	{#if error}<p class="text-body-medium text-error" role="alert">{error}</p>{/if}
	{#snippet footer()}
		{#if duplicate}
			<Button variant="outline" disabled={sending} onclick={() => send(true)}
				>Post mine anyway</Button
			>
			<Button
				onclick={() => {
					open = false;
					onvote(duplicate!);
				}}>Vote for it</Button
			>
		{:else}
			<Button variant="outline" onclick={() => (open = false)}>Cancel</Button>
			<Button type="submit" form="request-form" disabled={!valid || sending}>Post request</Button>
		{/if}
	{/snippet}
</Dialog>
