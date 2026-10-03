<script lang="ts">
	import Megaphone from '@lucide/svelte/icons/megaphone';
	import Menu from '@lucide/svelte/icons/menu';
	import Settings from '@lucide/svelte/icons/settings';
	import X from '@lucide/svelte/icons/x';
	import { Collapsible } from 'bits-ui';
	import { page } from '$app/state';
	import { buttonClass } from '#lib/components/ui/button.ts';
	import { NAV } from '#lib/site.ts';
	import IconLink from './IconLink.svelte';
	import Logo from './Logo.svelte';
	import SettingsDialog from './SettingsDialog.svelte';

	let { unread }: { unread: boolean } = $props();

	let menuOpen = $state(false);
	let settingsOpen = $state(false);

	$effect(() => {
		void page.url.pathname;
		menuOpen = false;
	});

	const current = (href: string) => page.url.pathname.startsWith(href);
</script>

{#snippet links(mobile: boolean)}
	{#each NAV as link (link.href)}
		<a
			href={link.href}
			aria-current={current(link.href) ? 'page' : undefined}
			class={[
				'font-medium transition-colors hover:text-foreground aria-[current=page]:text-foreground',
				mobile ? 'py-3 text-base text-muted-foreground' : 'text-sm text-muted-foreground',
			]}
		>
			{link.label}
		</a>
	{/each}
{/snippet}

<Collapsible.Root bind:open={menuOpen}>
	<header class="container-page flex h-18 items-center gap-6">
		<a href="/" class="group mr-auto flex items-center gap-2.5 text-lg font-bold tracking-tight">
			<Logo
				class="size-7 transition-transform duration-300 ease-spring group-hover:scale-110 group-hover:-rotate-6"
			/>
			Reseam
		</a>
		<nav aria-label="Main" class="hidden items-center gap-7 md:flex">{@render links(false)}</nav>
		<div class="flex items-center gap-1">
			<IconLink label="Announcements" icon={Megaphone} href="/announcements/" dot={unread} />
			<IconLink label="Settings" icon={Settings} onclick={() => (settingsOpen = true)} />
			<Collapsible.Trigger class="md:hidden {buttonClass('ghost', 'icon')}" aria-label="Menu">
				{#if menuOpen}<X size={18} />{:else}<Menu size={18} />{/if}
			</Collapsible.Trigger>
		</div>
	</header>
	<Collapsible.Content class="collapsible md:hidden">
		<nav aria-label="Main" class="container-page flex flex-col border-b border-border pb-3">
			{@render links(true)}
		</nav>
	</Collapsible.Content>
</Collapsible.Root>

<SettingsDialog bind:open={settingsOpen} />
