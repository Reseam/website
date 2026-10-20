<script lang="ts">
	import Forgejo from '#lib/components/brand/Forgejo.svelte';
	import GitHub from '#lib/components/brand/GitHub.svelte';
	import { MIRROR_URL, SOCIALS, SOURCE_URL } from '#lib/site.ts';
	import IconLink from './IconLink.svelte';
	import Logo from './Logo.svelte';

	const links = [
		{ label: 'Patches', href: '/patches/' },
		{ label: 'Patch online', href: '/patch/' },
		{ label: 'Docs', href: '/docs/' },
		{ label: 'Announcements', href: '/announcements/' },
		{ label: 'Donations', href: '/donate/' },
	];

	const sources = [
		{ label: 'Source on Forgejo', href: SOURCE_URL, icon: Forgejo },
		{ label: 'GitHub mirror', href: MIRROR_URL, icon: GitHub },
	];
</script>

<footer class="container-page mt-auto">
	<div class="flex flex-col gap-4 border-t border-outline-variant py-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<a href="/" class="flex items-center gap-2 text-label-large">
				<Logo class="size-5" /> Reseam
			</a>
			<nav
				aria-label="Footer"
				class="flex flex-wrap items-center gap-x-5 gap-y-2 text-body-medium text-on-surface-variant"
			>
				{#each links as link (link.href)}
					<a href={link.href} class="transition-colors hover:text-on-surface">{link.label}</a>
				{/each}
			</nav>
		</div>
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div
				class="flex flex-wrap items-center gap-x-5 gap-y-2 text-body-medium text-on-surface-variant"
			>
				{#each sources as source (source.href)}
					<a
						href={source.href}
						class="flex items-center gap-2 transition-colors hover:text-on-surface"
					>
						<source.icon size={16} />
						{source.label}
					</a>
				{/each}
			</div>
			<div class="flex items-center gap-1">
				{#each SOCIALS as social (social.href)}
					<IconLink label="Reseam on {social.name}" icon={social.icon} href={social.href} />
				{/each}
			</div>
		</div>
	</div>
</footer>
