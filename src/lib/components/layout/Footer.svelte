<script lang="ts">
	import GitBranch from '@lucide/svelte/icons/git-branch';
	import { SOURCE_URL } from '#lib/site.ts';
	import IconLink from './IconLink.svelte';
	import Logo from './Logo.svelte';

	const links = [
		{ label: 'Patches', href: '/patches/' },
		{ label: 'Patch online', href: '/patch/' },
		{ label: 'Docs', href: '/docs/' },
		{ label: 'Announcements', href: '/announcements/' },
	];
</script>

<footer class="container-page mt-auto">
	<div class="flex flex-wrap items-center justify-between gap-4 border-t border-border py-6">
		<a href="/" class="flex items-center gap-2 text-sm font-semibold">
			<Logo class="size-5" /> Reseam
		</a>
		<nav
			aria-label="Footer"
			class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
		>
			{#each links as link (link.href)}
				<a href={link.href} class="transition-colors hover:text-foreground">{link.label}</a>
			{/each}
			<IconLink label="Source code" icon={GitBranch} href={SOURCE_URL} />
		</nav>
	</div>
</footer>
