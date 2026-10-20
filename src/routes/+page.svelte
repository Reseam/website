<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Heart from '@lucide/svelte/icons/heart';
	import CallToAction from '#lib/components/home/CallToAction.svelte';
	import HeroDemo from '#lib/components/home/HeroDemo.svelte';
	import Steps from '#lib/components/home/Steps.svelte';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import Button from '#lib/components/ui/Button.svelte';
</script>

<PageMeta
	title="Reseam: a better way to use your apps"
	description="Add new features or remove annoyances from the apps you use every day. No technical skills required."
/>

<section
	class="container-page grid items-center gap-12 py-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:py-20"
>
	<div class="text-center lg:text-left">
		<h1 class="text-display-small lg:text-display-large">A better way to use your apps.</h1>
		<p
			class="mx-auto mt-5 mb-12 max-w-xs text-body-large text-on-surface-variant lg:mx-0 lg:max-w-100"
		>
			Add new features or remove annoyances from the apps you use every day. No technical skills
			required.
		</p>
		<div class="flex flex-wrap justify-center gap-3 lg:justify-start">
			<Button href="/download/" size="lg">Download <ArrowRight size={18} /></Button>
			<Button href="/patches/" size="lg" variant="outline">Browse patches</Button>
		</div>
	</div>
	<HeroDemo />
</section>

<Steps />

<CallToAction id="get" title="Get Reseam Manager" subtitle="For Android, Windows and Linux.">
	<p class="mt-4 text-body-medium text-on-surface-variant">
		Can't install it?
		<a
			href="/patch/"
			class="text-on-surface underline decoration-outline-variant underline-offset-4 transition-colors hover:decoration-primary"
			>Patch in your browser</a
		>. It's slower.
	</p>
	{#snippet action()}
		<Button href="/download/" size="lg">Download <ArrowRight size={18} /></Button>
	{/snippet}
</CallToAction>

<CallToAction
	id="support"
	title="Support Reseam"
	subtitle="Donations pay for the server, the domains and other resources."
>
	{#snippet action()}
		<Button href="/donate/" size="lg" variant="outline" class="group">
			<Heart
				size={17}
				class="text-primary transition-transform duration-300 ease-spring group-hover:scale-125"
			/> Donate
		</Button>
	{/snippet}
</CallToAction>
