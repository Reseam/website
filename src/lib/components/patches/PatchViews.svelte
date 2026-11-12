<script lang="ts">
	import { pillClass } from '#lib/components/ui/pill.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';

	let { current }: { current: 'official' | 'community' } = $props();

	const views = [
		{ id: 'official', label: m.patches_view_official, href: '/patches/' },
		{ id: 'community', label: m.patches_view_community, href: '/patches/community/' },
	] as const;
</script>

<nav aria-label={m.patches_view()} class="flex gap-2">
	{#each views as view (view.id)}
		<a
			href={localizeHref(view.href)}
			aria-current={view.id === current ? 'page' : undefined}
			class="h-9 px-4 {pillClass.link}">{view.label()}</a
		>
	{/each}
</nav>
