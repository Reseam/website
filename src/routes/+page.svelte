<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
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
		<h1 class="text-display font-bold">A better way to use your apps.</h1>
		<p class="mx-auto mt-6 mb-9 max-w-md text-lg text-muted-foreground lg:mx-0">
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

<section aria-labelledby="get" class="container-page">
	<div class="flex flex-wrap items-center justify-between gap-8 border-t border-border py-16">
		<div>
			<h2 id="get" class="text-3xl font-bold tracking-tight sm:text-4xl">Get Reseam Manager</h2>
			<p class="mt-2 text-muted-foreground">For Android, Windows and Linux.</p>
			<p class="mt-4 text-sm text-muted-foreground">
				Can't install it?
				<a
					href="/patch/"
					class="text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-primary"
					>Patch in your browser</a
				>. It's slower.
			</p>
		</div>
		<Button href="/download/" size="lg">Download <ArrowRight size={18} /></Button>
	</div>
</section>
