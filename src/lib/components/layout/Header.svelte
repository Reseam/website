<script lang="ts">
	import Megaphone from '@lucide/svelte/icons/megaphone';
	import Menu from '@lucide/svelte/icons/menu';
	import Settings from '@lucide/svelte/icons/settings';
	import X from '@lucide/svelte/icons/x';
	import { Collapsible } from 'bits-ui';
	import { page } from '$app/state';
	import { buttonClass } from '#lib/components/ui/button.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { locales, localizeHref } from '#lib/paraglide/runtime.js';
	import { NAV } from '#lib/site.ts';
	import IconLink from './IconLink.svelte';
	import LanguageMenu from './LanguageMenu.svelte';
	import Logo from './Logo.svelte';
	import SettingsDialog from './SettingsDialog.svelte';

	let { unread }: { unread: boolean } = $props();

	let menuOpen = $state(false);
	let settingsOpen = $state(false);

	$effect(() => {
		void page.url.pathname;
		menuOpen = false;
	});

	const current = (href: string) => page.url.pathname.startsWith(localizeHref(href));
</script>

{#snippet links(mobile: boolean)}
	{#each NAV as link (link.href)}
		<a
			href={localizeHref(link.href)}
			aria-current={current(link.href) ? 'page' : undefined}
			class={[
				'text-label-large text-on-surface-variant transition-colors hover:text-on-surface aria-[current=page]:text-on-surface',
				mobile && 'py-3',
			]}
		>
			{link.label()}
		</a>
	{/each}
{/snippet}

<Collapsible.Root bind:open={menuOpen}>
	<header class="container-page flex h-18 items-center gap-6">
		<a href={localizeHref('/')} class="group mr-auto flex items-center gap-2.5 text-title-large">
			<Logo
				class="size-7 transition-transform duration-300 ease-spring group-hover:scale-110 group-hover:-rotate-6"
			/>
			Reseam
		</a>
		<nav aria-label={m.nav_main()} class="hidden items-center gap-7 md:flex">
			{@render links(false)}
		</nav>
		<div class="flex items-center gap-1">
			<IconLink
				label={m.nav_updates()}
				icon={Megaphone}
				href={localizeHref('/updates/')}
				dot={unread}
			/>
			{#if locales.length > 1}<LanguageMenu />{/if}
			<IconLink label={m.nav_settings()} icon={Settings} onclick={() => (settingsOpen = true)} />
			<Collapsible.Trigger
				class="md:hidden {buttonClass('ghost', 'icon')}"
				aria-label={m.nav_menu()}
			>
				{#if menuOpen}<X size={18} />{:else}<Menu size={18} />{/if}
			</Collapsible.Trigger>
		</div>
	</header>
	<Collapsible.Content class="collapsible md:hidden">
		<nav
			aria-label={m.nav_main()}
			class="container-page flex flex-col border-b border-outline-variant pb-3"
		>
			{@render links(true)}
		</nav>
	</Collapsible.Content>
</Collapsible.Root>

<SettingsDialog bind:open={settingsOpen} />
