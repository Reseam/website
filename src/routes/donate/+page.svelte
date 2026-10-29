<script lang="ts">
	import Globe from '@lucide/svelte/icons/globe';
	import Heart from '@lucide/svelte/icons/heart';
	import Package from '@lucide/svelte/icons/package';
	import Server from '@lucide/svelte/icons/server';
	import WalletCard from '#lib/components/donate/WalletCard.svelte';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { SPONSORS_URL } from '#lib/site.ts';

	const costs = [
		{ icon: Server, label: 'Server' },
		{ icon: Globe, label: 'Domains' },
		{ icon: Package, label: 'Resources' },
	];

	const wallets = [
		{
			name: 'Bitcoin',
			symbol: 'BTC',
			address: 'bc1qa384kre06t2l8en5020wj5qqwua774aq3ytjn3',
			qr: '/donate/bitcoin.svg',
		},
		{
			name: 'Ethereum',
			symbol: 'ETH',
			address: '0x3136e5f8008E8E95C08eecB9780535cC4bdb227e',
			qr: '/donate/ethereum.svg',
		},
	];
</script>

<PageMeta
	title="Donations · Reseam"
	description="Support Reseam through GitHub Sponsors, Bitcoin or Ethereum. Donations pay for the server, the domains and other resources."
/>

<div class="container-page">
	<div class="mx-auto grid max-w-176 gap-6 pt-14 pb-20 text-center sm:pt-20">
		<header class="grid justify-items-center gap-6">
			<div class="relative grid size-24 place-items-center">
				<span class="absolute inset-0 animate-heart-ring rounded-full bg-primary-container"></span>
				<span class="relative grid size-24 place-items-center rounded-full bg-primary-container">
					<Heart size={40} fill="currentColor" class="animate-heartbeat text-primary" />
				</span>
			</div>

			<div class="grid gap-2">
				<h1 class="text-headline-large sm:text-display-medium">Support Reseam</h1>
				<p class="text-body-large text-on-surface-variant">
					Reseam is free. Donations pay for the server, the domains and other resources.
				</p>
			</div>

			<ul class="flex flex-wrap justify-center gap-x-6 gap-y-2 text-on-surface-variant">
				{#each costs as cost (cost.label)}
					<li class="flex items-center gap-2">
						<cost.icon size={18} class="text-primary" />
						<span class="text-label-large">{cost.label}</span>
					</li>
				{/each}
			</ul>

			<Button href={SPONSORS_URL} size="lg" class="group">
				<Heart
					size={17}
					class="transition-transform duration-300 ease-spring group-hover:scale-125"
				/> Sponsor on GitHub
			</Button>
		</header>

		<section aria-labelledby="crypto" class="grid gap-6">
			<h2 id="crypto" class="text-title-large">Or send crypto</h2>
			<ul class="grid gap-6 sm:grid-cols-2">
				{#each wallets as wallet (wallet.symbol)}
					<WalletCard {...wallet} />
				{/each}
			</ul>
		</section>
	</div>
</div>
