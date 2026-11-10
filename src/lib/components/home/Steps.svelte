<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import { m } from '#lib/paraglide/messages.js';
	import PhoneTop from './PhoneTop.svelte';

	const apps = [
		{ number: 2, color: 'bg-app-violet' },
		{ number: 1, color: 'bg-app-blue', picked: true },
		{ number: 3, color: 'bg-warning' },
	];
	const toggles = [
		{ label: m.steps_toggle_ads, on: true },
		{ label: m.steps_toggle_dark, on: true },
		{ label: m.steps_toggle_background, on: false },
		{ label: m.steps_toggle_tracking, on: true },
	];
</script>

{#snippet caption(step: number, title: string, text: string)}
	<span class="mt-3 text-label-medium text-primary">{m.steps_step({ step })}</span>
	<h3 class="text-title-large">{title}</h3>
	<p class="text-body-large text-on-surface-variant">{text}</p>
{/snippet}

<section aria-labelledby="how" class="container-page py-20">
	<h2 id="how" class="mb-10 text-headline-medium sm:text-display-small">{m.steps_title()}</h2>
	<ol class="grid gap-5 md:grid-cols-3">
		<li class="grid gap-1.5">
			<PhoneTop label={m.steps_pick_label()}>
				<p class="mb-1 px-1 text-label-medium">{m.steps_pick_screen()}</p>
				{#each apps as app (app.number)}
					<div
						class="flex items-center gap-2.5 rounded-md px-2 py-1.5 {app.picked
							? 'bg-secondary-container ring-1 ring-primary'
							: ''}"
					>
						<span class="size-6 rounded-sm {app.color}"></span>
						<span class="flex-1">{m.steps_app_name({ number: app.number })}</span>
						{#if app.picked}<span
								class="grid size-4 place-items-center rounded-full bg-primary text-on-primary"
								><Check size={10} strokeWidth={3.5} /></span
							>{/if}
					</div>
				{/each}
			</PhoneTop>
			{@render caption(1, m.steps_pick_title(), m.steps_pick_text())}
		</li>
		<li class="grid gap-1.5">
			<PhoneTop label={m.steps_patches_label()}>
				<p class="mb-1 px-1 text-label-medium">{m.steps_patches_screen()}</p>
				{#each toggles as toggle (toggle.label)}
					<div class="flex items-center justify-between px-1 py-1">
						{toggle.label()}
						<span
							class="flex h-4.5 w-7.5 rounded-full p-0.5 {toggle.on
								? 'justify-end bg-primary'
								: 'bg-phone-dark-line'}"
						>
							<span
								class="size-3.5 rounded-full {toggle.on
									? 'bg-on-primary'
									: 'bg-on-surface-variant'}"
							></span>
						</span>
					</div>
				{/each}
			</PhoneTop>
			{@render caption(2, m.steps_patches_title(), m.steps_patches_text())}
		</li>
		<li class="grid gap-1.5">
			<PhoneTop label={m.steps_install_label()}>
				<div class="grid justify-items-center gap-2 pt-3 text-center">
					<span
						class="grid size-11 place-items-center rounded-full bg-secondary-container text-primary"
						><Check size={20} strokeWidth={3} /></span
					>
					<p class="text-label-large">{m.steps_install_ready()}</p>
					<p class="text-on-surface-variant">{m.steps_install_applied()}</p>
					<span class="mt-1 rounded-md bg-primary px-5 py-1.5 text-label-medium text-on-primary"
						>{m.steps_install_button()}</span
					>
				</div>
			</PhoneTop>
			{@render caption(3, m.steps_install_title(), m.steps_install_text())}
		</li>
	</ol>
</section>
