<script lang="ts">
	import { page } from '$app/state';
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { ChevronDown } from 'lucide-svelte';
	import { docs } from '$lib/docs';
	import { cn } from '$lib/cn';

	let { children } = $props();

	const activeGroup = $derived.by(() => {
		const match = page.url.pathname.match(/^\/docs\/([^/]+)/);
		return match?.[1];
	});

	let overrides = $state<Record<string, boolean>>({});

	function isActive(slug: string) {
		return page.url.pathname.replace(/\/$/, '').endsWith(`/docs/${slug}`);
	}

	function isOpen(groupSlug: string) {
		return overrides[groupSlug] ?? groupSlug === activeGroup;
	}

	function toggle(groupSlug: string) {
		overrides = { ...overrides, [groupSlug]: !isOpen(groupSlug) };
	}
</script>

<div class="container mx-auto px-6 py-12 lg:py-16 flex flex-col md:flex-row gap-10">
	<aside class="w-full md:w-64 shrink-0">
		<div class="sticky top-28 space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
			{#if docs.groups.length === 0}
				<p class="text-sm text-muted-foreground">
					No docs published yet. Add markdown files under <code class="text-xs">docs/</code> in any source
					repo.
				</p>
			{/if}
			{#each docs.groups as group (group.slug)}
				{@const open = isOpen(group.slug)}
				<div>
					<button
						type="button"
						onclick={() => toggle(group.slug)}
						class="w-full flex items-center justify-between py-2 text-left group"
					>
						<span
							class={cn(
								'font-semibold text-sm tracking-tight transition-colors',
								open ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
							)}
						>
							{group.label}
						</span>
						<ChevronDown
							size={14}
							class={cn(
								'text-muted-foreground transition-transform',
								open ? 'rotate-0' : '-rotate-90'
							)}
						/>
					</button>
					{#if open}
						<div transition:slide={{ duration: 180, easing: cubicOut }} class="space-y-4 pb-3">
							{#each group.sections as section (section.key)}
								<div>
									{#if section.key !== 'standalone'}
										<p class="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-1.5">
											{section.label}
										</p>
									{/if}
									<ul class="space-y-1.5 text-sm border-l border-border">
										{#each section.pages as item (item.slug)}
											<li>
												<a
													href="/docs/{item.slug}/"
													class={cn(
														'block pl-3 -ml-px border-l transition-colors',
														isActive(item.slug)
															? 'border-primary text-foreground font-medium'
															: 'border-transparent text-muted-foreground hover:text-foreground'
													)}
												>
													{item.title}
												</a>
											</li>
										{/each}
									</ul>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</aside>

	<main class="flex-1 min-w-0 max-w-3xl">
		{@render children()}
	</main>
</div>
