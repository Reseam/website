<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import PhoneTop from './PhoneTop.svelte';

	const apps = [
		{ name: 'App 2', color: 'bg-app-violet' },
		{ name: 'App 1', color: 'bg-app-blue', picked: true },
		{ name: 'App 3', color: 'bg-app-amber' },
	];
	const toggles = [
		{ label: 'Block ads', on: true },
		{ label: 'AMOLED dark', on: true },
		{ label: 'Background play', on: false },
		{ label: 'No tracking', on: true },
	];
</script>

{#snippet caption(step: number, title: string, text: string)}
	<span class="mt-3 text-xs font-semibold tracking-[0.2em] text-primary uppercase">Step {step}</span
	>
	<h3 class="text-lg font-semibold tracking-tight">{title}</h3>
	<p class="text-muted-foreground">{text}</p>
{/snippet}

<section aria-labelledby="how" class="container-page py-20">
	<h2 id="how" class="mb-10 text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
	<ol class="grid gap-5 md:grid-cols-3">
		<li class="grid gap-1.5">
			<PhoneTop label="A phone listing three apps, with App 1 selected">
				<p class="mb-1 px-1 font-semibold">Choose an app</p>
				{#each apps as app (app.name)}
					<div
						class="flex items-center gap-2.5 rounded-md px-2 py-1.5 {app.picked
							? 'bg-primary/12 ring-1 ring-primary/40'
							: ''}"
					>
						<span class="size-6 rounded-sm {app.color}"></span>
						<span class="flex-1">{app.name}</span>
						{#if app.picked}<span
								class="grid size-4 place-items-center rounded-full bg-primary text-primary-foreground"
								><Check size={10} strokeWidth={3.5} /></span
							>{/if}
					</div>
				{/each}
			</PhoneTop>
			{@render caption(1, 'Pick an app', 'Choose the app you want to change.')}
		</li>
		<li class="grid gap-1.5">
			<PhoneTop label="A phone showing four patch switches, three of them on">
				<p class="mb-1 px-1 font-semibold">Patches</p>
				{#each toggles as toggle (toggle.label)}
					<div class="flex items-center justify-between px-1 py-1">
						{toggle.label}
						<span
							class="flex h-4.5 w-7.5 rounded-full p-0.5 {toggle.on
								? 'justify-end bg-primary'
								: 'bg-phone-dark-line'}"
						>
							<span
								class="size-3.5 rounded-full {toggle.on
									? 'bg-primary-foreground'
									: 'bg-muted-foreground'}"
							></span>
						</span>
					</div>
				{/each}
			</PhoneTop>
			{@render caption(
				2,
				'Choose your patches',
				'Turn on what you want. Each patch says what it does.'
			)}
		</li>
		<li class="grid gap-1.5">
			<PhoneTop label="A phone showing App 1 ready to install with 3 patches applied">
				<div class="grid justify-items-center gap-2 pt-3 text-center">
					<span class="grid size-11 place-items-center rounded-full bg-primary/15 text-primary"
						><Check size={20} strokeWidth={3} /></span
					>
					<p class="text-sm font-semibold">App 1 is ready</p>
					<p class="text-muted-foreground">3 patches applied</p>
					<span class="mt-1 rounded-md bg-primary px-5 py-1.5 font-semibold text-primary-foreground"
						>Install</span
					>
				</div>
			</PhoneTop>
			{@render caption(3, 'Install', 'Reseam builds it on your device in seconds.')}
		</li>
	</ol>
</section>
