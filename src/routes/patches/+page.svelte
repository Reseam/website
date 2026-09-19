<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { CircleAlert as AlertCircle, Globe2, Package, Search, Settings2 } from 'lucide-svelte';
	import { fetchLatestPatches } from '$lib/api';
	import { cn } from '$lib/cn';
	import PageMeta from '$lib/components/PageMeta.svelte';
	import { settings } from '$lib/settings.svelte';
	import type { PatchInfo, PatchOption, PatchOptionValue, ReleaseResponse } from '$lib/types';

	type PatchGroup = {
		key: string;
		packageName: string | null;
		patches: Array<{ patch: PatchInfo; versions: string[] | null }>;
	};

	let query = $state('');
	let selectedGroup = $state<string>();
	let catalog = $state<Promise<ReleaseResponse>>();

	$effect(() => {
		catalog = fetchLatestPatches(settings.apiUrl);
	});

	function matches(patch: PatchInfo, value: string): boolean {
		const needle = value.trim().toLocaleLowerCase();
		if (!needle) return true;
		const packages =
			patch.compatibility.kind === 'packages'
				? patch.compatibility.packages.map((entry) => entry.package)
				: [];
		return [patch.name, patch.description, patch.id, ...packages].some((field) =>
			field.toLocaleLowerCase().includes(needle)
		);
	}

	function groupPatches(patches: PatchInfo[]): PatchGroup[] {
		const groups = patches.reduce((catalog, patch) => {
			const compatibility =
				patch.compatibility.kind === 'packages'
					? patch.compatibility.packages.map((entry) => ({
							key: `package:${entry.package}`,
							packageName: entry.package,
							versions: [...new Set(entry.versions)],
						}))
					: [{ key: 'universal', packageName: null, versions: null }];

			for (const entry of compatibility) {
				const group = catalog.get(entry.key) ?? {
					key: entry.key,
					packageName: entry.packageName,
					patches: [],
				};
				const existing = group.patches.find(
					(candidate) => candidate.patch.bundle === patch.bundle && candidate.patch.id === patch.id
				);
				if (existing === undefined) {
					group.patches.push({ patch, versions: entry.versions });
				} else if (existing.versions !== null && entry.versions !== null) {
					existing.versions =
						existing.versions.length === 0 || entry.versions.length === 0
							? []
							: [...new Set([...existing.versions, ...entry.versions])];
				}
				catalog.set(entry.key, group);
			}

			return catalog;
		}, new Map<string, PatchGroup>());

		return [...groups.values()]
			.map((group) => ({
				...group,
				patches: group.patches.toSorted((left, right) =>
					left.patch.name.localeCompare(right.patch.name)
				),
			}))
			.toSorted((left, right) => {
				if (left.packageName === null) return 1;
				if (right.packageName === null) return -1;
				return left.packageName.localeCompare(right.packageName);
			});
	}

	function groupName(group: PatchGroup): string {
		return group.packageName ?? 'Universal';
	}

	function optionTypeLabel(option: PatchOption): string {
		switch (option.option_type) {
			case 'string':
				return 'Text';
			case 'bool':
				return 'Toggle';
			case 'int':
				return 'Whole number';
			case 'float':
				return 'Number';
			case 'string_list':
				return 'Text list';
			case 'path':
				return 'File path';
		}
	}

	function optionDefault(value: PatchOptionValue | null): string | null {
		if (value === null) return null;

		switch (value.type) {
			case 'bool':
				return value.value ? 'On' : 'Off';
			case 'string_list':
				return value.value.length > 0 ? value.value.join(', ') : 'None';
			case 'string':
			case 'path':
				return value.value || 'Empty';
			case 'int':
			case 'float':
				return value.value.toLocaleString();
		}
	}
</script>

<PageMeta
	title="Patches · Reseam"
	description="Browse the patches available in the latest official Reseam bundle."
/>

{#snippet loading()}
	<div class="space-y-4">
		<div class="h-12 bg-muted rounded-[1rem] animate-pulse"></div>
		<div class="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
			<div class="h-64 bg-muted rounded-[1.25rem] animate-pulse"></div>
			<div class="h-96 bg-muted rounded-[1.25rem] animate-pulse"></div>
		</div>
	</div>
{/snippet}

<div class="container mx-auto px-6 py-20 max-w-6xl min-h-[60vh]">
	<div in:fly={{ y: 10, duration: 400 }}>
		{#if !catalog}
			{@render loading()}
		{:else}
			{#await catalog}
				{@render loading()}
			{:then { release }}
				{@const published = release.patches}
				{@const patches = (published ?? []).filter((patch) => !patch.hidden)}
				{@const visible = patches.filter((patch) => matches(patch, query))}
				{@const groups = groupPatches(visible)}
				{@const activeGroup = groups.find((group) => group.key === selectedGroup) ?? groups[0]}

				<h1 class="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Patches</h1>
				<p class="mb-8 text-lg text-muted-foreground">
					Browse available patches for supported apps.
				</p>

				{#if published === undefined}
					<div
						class="p-6 bg-card border border-border rounded-[1.5rem] flex items-start gap-4 text-muted-foreground"
					>
						<AlertCircle size={20} class="shrink-0 mt-0.5" />
						<p>This release was published before patch catalogs were available.</p>
					</div>
				{:else}
					<label class="relative block mb-8">
						<span class="sr-only">Search patches</span>
						<Search
							size={18}
							class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
						/>
						<input
							bind:value={query}
							type="search"
							placeholder="Search patches or apps"
							class="w-full h-12 rounded-[1rem] border border-border bg-card pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:border-primary"
						/>
					</label>

					{#if activeGroup === undefined}
						<div class="text-center py-20 text-muted-foreground flex flex-col items-center">
							<Package size={40} class="mb-4 opacity-20" />
							<p>
								{query.trim() ? `No patches match “${query.trim()}”.` : 'No public patches yet.'}
							</p>
						</div>
					{:else}
						<div class="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start lg:gap-6">
							<label class="block mb-5 lg:hidden">
								<span class="sr-only">Select an app</span>
								<select
									value={activeGroup.key}
									onchange={(event) => (selectedGroup = event.currentTarget.value)}
									class="w-full h-12 rounded-[1rem] border border-border bg-card px-4 text-foreground"
								>
									{#each groups as group (group.key)}
										<option value={group.key}>{groupName(group)} ({group.patches.length})</option>
									{/each}
								</select>
							</label>

							<aside class="hidden lg:block sticky top-28">
								<nav
									aria-label="Apps"
									class="bg-card border border-border rounded-[1.25rem] overflow-hidden divide-y divide-border"
								>
									{#each groups as group (group.key)}
										<button
											type="button"
											onclick={() => (selectedGroup = group.key)}
											aria-pressed={group.key === activeGroup.key}
											class={cn(
												'w-full px-4 py-3 text-left transition-colors hover:bg-muted/60',
												group.key === activeGroup.key && 'bg-primary/10 hover:bg-primary/10'
											)}
										>
											<span class="flex items-start gap-2.5">
												{#if group.packageName === null}
													<Globe2
														size={15}
														class={cn(
															'shrink-0 mt-0.5',
															group.key === activeGroup.key
																? 'text-primary'
																: 'text-muted-foreground'
														)}
													/>
												{:else}
													<Package
														size={15}
														class={cn(
															'shrink-0 mt-0.5',
															group.key === activeGroup.key
																? 'text-primary'
																: 'text-muted-foreground'
														)}
													/>
												{/if}
												<span class="min-w-0 flex-1">
													<span
														class={cn(
															'block break-words text-sm font-medium',
															group.key === activeGroup.key && 'font-semibold'
														)}>{groupName(group)}</span
													>
													<span class="block text-xs text-muted-foreground mt-0.5"
														>{group.patches.length}
														{group.patches.length === 1 ? 'patch' : 'patches'}</span
													>
												</span>
											</span>
										</button>
									{/each}
								</nav>
							</aside>

							{#key activeGroup.key}
								<section
									in:fade={{ duration: 180 }}
									class="bg-card border border-border rounded-[1.25rem] overflow-hidden"
								>
									<div class="divide-y divide-border">
										{#each activeGroup.patches as entry (`${entry.patch.bundle}/${entry.patch.id}`)}
											{@const patch = entry.patch}
											<article class="px-5 py-4 sm:px-6">
												<h3 class="font-medium">{patch.name}</h3>
												{#if patch.description}
													<p class="text-sm text-muted-foreground mt-1 leading-relaxed">
														{patch.description}
													</p>
												{/if}
												<div class="mt-3 flex flex-wrap items-center gap-1.5">
													<span class="mr-1 text-xs text-muted-foreground">Versions</span>
													{#if entry.versions === null || entry.versions.length === 0}
														<span
															class="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs text-foreground"
															>All versions</span
														>
													{:else}
														{#each entry.versions as version (version)}
															<span
																class="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs text-foreground"
																>{version}</span
															>
														{/each}
													{/if}
												</div>
												{#if patch.options.length > 0}
													<details class="mt-3">
														<summary
															class="cursor-pointer select-none inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
															><Settings2 size={13} />
															{patch.options.length}
															{patch.options.length === 1 ? 'option' : 'options'}</summary
														>
														<ul class="mt-3 pl-5 border-l border-border space-y-3">
															{#each patch.options as option (option.key)}
																{@const defaultValue = optionDefault(option.default_value)}
																<li class="text-sm">
																	<div class="flex flex-wrap items-center gap-2">
																		<p class="font-medium">{option.title || option.key}</p>
																		<span
																			class="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
																			>{optionTypeLabel(option)}</span
																		>
																		{#if option.required}
																			<span class="text-xs text-muted-foreground">Required</span>
																		{/if}
																	</div>
																	{#if option.description}<p class="text-muted-foreground mt-0.5">
																			{option.description}
																		</p>{/if}
																	{#if defaultValue !== null}
																		<p class="mt-1 text-xs text-muted-foreground">
																			Default: <span class="text-foreground">{defaultValue}</span>
																		</p>
																	{/if}
																	{#if option.valid_values && option.valid_values.length > 0}
																		<p class="mt-1 text-xs text-muted-foreground">
																			Choices: {option.valid_values.join(', ')}
																		</p>
																	{/if}
																</li>
															{/each}
														</ul>
													</details>
												{/if}
											</article>
										{/each}
									</div>
								</section>
							{/key}
						</div>
					{/if}
				{/if}
			{:catch}
				<div
					class="p-6 bg-destructive/10 text-destructive border border-destructive/20 rounded-[1.5rem] flex items-center gap-4"
				>
					<AlertCircle size={20} class="shrink-0" />
					<p>API unavailable. Try again later, or point to a different endpoint in Settings.</p>
				</div>
			{/await}
		{/if}
	</div>
</div>
