<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import DocContent from '#lib/components/docs/DocContent.svelte';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';

	let { data } = $props();
</script>

<PageMeta title="Docs · Reseam" description={data.hub.description} />

<p class="text-label-large text-primary">Docs</p>
<h1 class="mt-1 text-headline-large sm:text-display-medium">{data.hub.title}</h1>
<div class="mt-4"><DocContent html={data.hub.html} variant="lead" /></div>

{#each data.groups as group (group.slug)}
	<section aria-labelledby="group-{group.slug}" class="mt-12 grid gap-4">
		<div>
			<h2 id="group-{group.slug}" class="text-title-large">{group.label}</h2>
			<p class="mt-1 text-body-large text-on-surface-variant">{group.summary}</p>
		</div>
		<ol
			class="grid overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low xl:grid-cols-2"
		>
			{#each group.sections.flatMap((section) => section.pages) as link, index (link.slug)}
				<li class="-mb-px border-b border-outline-variant xl:odd:border-r">
					<a
						href="/docs/{link.slug}/"
						class="group flex h-full items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-container"
					>
						<span class="w-6 shrink-0 font-mono text-mono-xs-semibold text-primary tabular-nums"
							>{String(index + 1).padStart(2, '0')}</span
						>
						<span class="grid min-w-0 flex-1">
							<span class="text-title-medium">{link.title}</span>
							{#if link.description}<span class="text-body-medium text-on-surface-variant"
									>{link.description}</span
								>{/if}
						</span>
						<ChevronRight
							size={16}
							class="shrink-0 text-on-surface-variant transition-[color,translate] duration-200 group-hover:translate-x-0.5 group-hover:text-on-surface"
						/>
					</a>
				</li>
			{/each}
		</ol>
	</section>
{/each}
