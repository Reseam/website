<script lang="ts">
	import Globe from '@lucide/svelte/icons/globe';
	import Heart from '@lucide/svelte/icons/heart';
	import Package from '@lucide/svelte/icons/package';
	import Server from '@lucide/svelte/icons/server';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { SPONSORS_URL } from '#lib/site.ts';

	const costs = [
		{ icon: Server, label: 'Server' },
		{ icon: Globe, label: 'Domains' },
		{ icon: Package, label: 'Resources' },
	];
</script>

<PageMeta
	title="Donations · Reseam"
	description="Support Reseam through GitHub Sponsors. Donations pay for the server, the domains and other resources."
/>

<div class="container-page">
	<div class="mx-auto grid max-w-176 justify-items-center gap-8 pt-14 pb-20 text-center sm:pt-20">
		<div class="relative grid size-24 place-items-center">
			<span class="absolute inset-0 animate-heart-ring rounded-full bg-primary-container"></span>
			<span class="relative grid size-24 place-items-center rounded-full bg-primary-container">
				<Heart size={40} fill="currentColor" class="animate-heartbeat text-primary" />
			</span>
		</div>

		<div class="grid gap-3">
			<h1 class="text-headline-large sm:text-display-medium">Support Reseam</h1>
			<p class="text-body-large text-on-surface-variant">
				Reseam is free. Donations pay for the server, the domains and other resources.
			</p>
		</div>

		<Button href={SPONSORS_URL} size="lg" class="group">
			<Heart
				size={17}
				class="transition-transform duration-300 ease-spring group-hover:scale-125"
			/> Sponsor on GitHub
		</Button>

		<ul class="grid w-full gap-3 sm:grid-cols-3">
			{#each costs as cost (cost.label)}
				<li
					class="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 sm:flex-col sm:py-5"
				>
					<cost.icon size={20} class="text-primary" />
					<span class="text-label-large">{cost.label}</span>
				</li>
			{/each}
		</ul>
	</div>
</div>
