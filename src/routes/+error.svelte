<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import Logo from '#lib/components/layout/Logo.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';

	const missing = $derived(page.status === 404);

	// The pieces drift apart after the page appears, so the change is visible.
	let apart = $state(false);
	onMount(() => requestAnimationFrame(() => (apart = true)));
</script>

<svelte:head
	><title>{m.page_title({ title: missing ? m.error_not_found_title() : m.error_title() })}</title
	></svelte:head
>

<div
	class="container-page grid flex-1 place-content-center justify-items-center gap-3 py-20 text-center"
>
	<Logo class="mb-4 size-28" {apart} />
	<p class="text-label-large text-primary">{page.status}</p>
	<h1 class="text-headline-large sm:text-display-medium">
		{missing ? m.error_not_found_heading() : m.error_heading()}
	</h1>
	<p class="text-body-large text-on-surface-variant">
		{missing ? m.error_not_found_text() : page.error?.message}
	</p>
	<div class="mt-5 flex flex-wrap justify-center gap-3">
		<Button href={localizeHref('/')} size="lg">{m.action_back_home()}</Button>
		<Button href={localizeHref('/patches/')} size="lg" variant="outline"
			>{m.action_browse_patches()}</Button
		>
	</div>
</div>
