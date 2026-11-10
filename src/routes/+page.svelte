<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Heart from '@lucide/svelte/icons/heart';
	import CallToAction from '#lib/components/home/CallToAction.svelte';
	import IconLink from '#lib/components/layout/IconLink.svelte';
	import Forgejo from '#lib/components/brand/Forgejo.svelte';
	import GitHub from '#lib/components/brand/GitHub.svelte';
	import HeroDemo from '#lib/components/home/HeroDemo.svelte';
	import Steps from '#lib/components/home/Steps.svelte';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { MIRROR_URL, SOCIALS, SOURCE_URL } from '#lib/site.ts';
</script>

<PageMeta title={m.home_meta_title()} description={m.home_lead()} />

<section
	class="container-page grid items-center gap-12 py-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:py-20"
>
	<div class="text-center lg:text-left">
		<h1 class="text-display-small lg:text-display-large">{m.home_title()}</h1>
		<p
			class="mx-auto mt-5 mb-12 max-w-xs text-body-large text-on-surface-variant lg:mx-0 lg:max-w-100"
		>
			{m.home_lead()}
		</p>
		<div class="flex flex-wrap justify-center gap-3 lg:justify-start">
			<Button href={localizeHref('/download/')} size="lg"
				>{m.action_download()} <ArrowRight size={18} /></Button
			>
			<Button href={localizeHref('/patches/')} size="lg" variant="outline"
				>{m.action_browse_patches()}</Button
			>
		</div>
		<p
			class="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-body-medium text-on-surface-variant lg:justify-start"
		>
			{m.home_open_source()}
			<a
				href={SOURCE_URL}
				class="inline-flex items-center gap-1.5 text-on-surface underline decoration-outline-variant underline-offset-4 transition-colors hover:decoration-primary"
				><Forgejo size={16} /> Forgejo</a
			>
			<a
				href={MIRROR_URL}
				class="inline-flex items-center gap-1.5 text-on-surface underline decoration-outline-variant underline-offset-4 transition-colors hover:decoration-primary"
				><GitHub size={16} /> {m.site_mirror()}</a
			>
		</p>
		<p class="mt-3 text-body-medium text-on-surface-variant">{m.home_made_by()}</p>
		<div class="mt-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
			{#each SOCIALS as social (social.href)}
				<IconLink
					label={m.footer_social({ name: social.name })}
					icon={social.icon}
					href={social.href}
					variant="outline"
					iconSize={20}
				/>
			{/each}
			<Button href={localizeHref('/donate/')} variant="outline" class="group">
				<Heart
					size={16}
					class="text-primary transition-transform duration-300 ease-spring group-hover:scale-125"
				/>
				{m.action_donate()}
			</Button>
		</div>
	</div>
	<HeroDemo />
</section>

<Steps />

<CallToAction id="get" title={m.home_get_title()} subtitle={m.home_get_subtitle()}>
	<p class="mt-4 text-body-medium text-on-surface-variant">
		{m.home_get_fallback()}
		<a
			href={localizeHref('/patch/')}
			class="text-on-surface underline decoration-outline-variant underline-offset-4 transition-colors hover:decoration-primary"
			>{m.home_get_fallback_link()}</a
		>
	</p>
	{#snippet action()}
		<Button href={localizeHref('/download/')} size="lg"
			>{m.action_download()} <ArrowRight size={18} /></Button
		>
	{/snippet}
</CallToAction>

<CallToAction id="requests" title={m.home_requests_title()} subtitle={m.home_requests_subtitle()}>
	{#snippet action()}
		<Button href={localizeHref('/requests/')} size="lg" variant="outline"
			>{m.action_request_patch()}</Button
		>
	{/snippet}
</CallToAction>

<CallToAction id="support" title={m.home_support_title()} subtitle={m.home_support_subtitle()}>
	{#snippet action()}
		<Button href={localizeHref('/donate/')} size="lg" variant="outline" class="group">
			<Heart
				size={17}
				class="text-primary transition-transform duration-300 ease-spring group-hover:scale-125"
			/>
			{m.action_donate()}
		</Button>
	{/snippet}
</CallToAction>
