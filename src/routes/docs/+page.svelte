<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import DocContent from '#lib/components/docs/DocContent.svelte';
	import PageMeta from '#lib/components/layout/PageMeta.svelte';

	let { data } = $props();
</script>

<PageMeta title="Docs · Reseam" description={data.hub.description} />

<p class="text-sm font-semibold text-primary">Docs</p>
<h1 class="mt-1 text-title font-bold">{data.hub.title}</h1>
<div class="mt-4"><DocContent html={data.hub.html} /></div>

{#each data.groups as group (group.slug)}
	<section aria-labelledby="group-{group.slug}" class="mt-12 grid gap-4">
		<div>
			<h2 id="group-{group.slug}" class="text-xl font-semibold tracking-tight">{group.label}</h2>
			<p class="mt-1 text-muted-foreground">{group.summary}</p>
		</div>
		<ol class="grid overflow-hidden rounded-lg border border-border bg-card xl:grid-cols-2">
			{#each group.sections.flatMap((section) => section.pages) as link, index (link.slug)}
				<li class="-mb-px border-b border-border xl:odd:border-r">
					<a
						href="/docs/{link.slug}/"
						class="group flex h-full items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted"
					>
						<span class="w-6 shrink-0 font-mono text-xs font-semibold text-primary tabular-nums"
							>{String(index + 1).padStart(2, '0')}</span
						>
						<span class="grid min-w-0 flex-1">
							<span class="font-semibold">{link.title}</span>
							{#if link.description}<span class="text-sm text-muted-foreground"
									>{link.description}</span
								>{/if}
						</span>
						<ChevronRight
							size={16}
							class="shrink-0 text-muted-foreground transition-[color,translate] duration-200 group-hover:translate-x-0.5 group-hover:text-foreground"
						/>
					</a>
				</li>
			{/each}
		</ol>
	</section>
{/each}
