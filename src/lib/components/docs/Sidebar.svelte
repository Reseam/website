<script lang="ts">
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { Collapsible } from 'bits-ui';
	import { page } from '$app/state';
	import SearchField from '#lib/components/ui/SearchField.svelte';
	import type { DocGroup } from '#lib/docs/types.ts';

	let { groups }: { groups: DocGroup[] } = $props();

	let query = $state('');
	let menuOpen = $state(false);

	const current = $derived(page.url.pathname.replace(/^\/docs\/|\/$/g, ''));
	const currentTitle = $derived(
		groups
			.flatMap((group) => group.sections.flatMap((section) => section.pages))
			.find(({ slug }) => slug === current)?.title ?? 'Docs'
	);
	const filtered = $derived(
		groups
			.map((group) => ({
				...group,
				sections: group.sections
					.map((section) => ({
						...section,
						pages: section.pages.filter(({ title }) =>
							title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
						),
					}))
					.filter((section) => section.pages.length > 0),
			}))
			.filter((group) => group.sections.length > 0)
	);

	$effect(() => {
		void current;
		menuOpen = false;
	});
</script>

{#snippet links()}
	<nav aria-label="Docs" class="grid gap-1">
		<div class="mb-3"><SearchField bind:value={query} label="Search docs" /></div>
		{#each filtered as group (group.slug)}
			<Collapsible.Root
				open={query.trim() !== '' || current.startsWith(`${group.slug}/`) || current === ''}
			>
				<Collapsible.Trigger
					class="group flex w-full items-center justify-between rounded-sm px-2.5 py-2 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:text-foreground"
				>
					{group.label}
					<ChevronRight
						size={14}
						class="transition-transform duration-200 group-aria-expanded:rotate-90"
					/>
				</Collapsible.Trigger>
				<Collapsible.Content class="collapsible">
					{#each group.sections as section (section.label)}
						{#if section.label !== 'Guide'}
							<p
								class="mt-3 mb-1 ml-5 text-[0.68rem] font-medium tracking-[0.12em] text-muted-foreground uppercase"
							>
								{section.label}
							</p>
						{/if}
						<ul class="ml-3 grid gap-px border-l border-border pb-2 pl-2">
							{#each section.pages as link (link.slug)}
								<li>
									<a
										href="/docs/{link.slug}/"
										aria-current={link.slug === current ? 'page' : undefined}
										class="block rounded-sm px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
									>
										{link.title}
									</a>
								</li>
							{/each}
						</ul>
					{/each}
				</Collapsible.Content>
			</Collapsible.Root>
		{:else}
			<p class="px-2.5 py-4 text-sm text-muted-foreground">No pages match “{query.trim()}”.</p>
		{/each}
	</nav>
{/snippet}

<div
	class="hidden lg:sticky lg:top-6 lg:block lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:pr-2 lg:[scrollbar-width:thin]"
>
	{@render links()}
</div>

<Collapsible.Root bind:open={menuOpen} class="lg:hidden">
	<Collapsible.Trigger
		class="group flex w-full items-center justify-between rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium"
	>
		{currentTitle}
		<ChevronDown
			size={16}
			class="transition-transform duration-200 group-aria-expanded:rotate-180"
		/>
	</Collapsible.Trigger>
	<Collapsible.Content class="collapsible">
		<div class="pt-3">{@render links()}</div>
	</Collapsible.Content>
</Collapsible.Root>
