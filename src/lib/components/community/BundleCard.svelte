<script lang="ts">
	import { addSourceLink } from '#lib/add-source.ts';
	import { appsText, communityPath } from '#lib/community.ts';
	import Button from '#lib/components/ui/Button.svelte';
	import { shortDate } from '#lib/format.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { AppInfo, CommunityBundle } from '#lib/types.ts';
	import AppStack from './AppStack.svelte';

	let { bundle, names }: { bundle: CommunityBundle; names: Record<string, AppInfo> } = $props();
</script>

<article
	class="relative flex h-full flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-5 transition-colors duration-150 hover:bg-surface-container"
>
	<div class="flex items-start justify-between gap-3">
		<div class="grid min-w-0">
			<h2 class="truncate text-title-medium">
				<a
					href={communityPath(bundle.slug)}
					class="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-primary"
					>{bundle.name}</a
				>
			</h2>
			<p class="truncate text-body-medium text-on-surface-variant">
				{m.by_author({ author: bundle.author })}
			</p>
		</div>
		<Button
			href={addSourceLink(bundle.index_url)}
			size="sm"
			class="relative"
			aria-label={`${m.community_add()}: ${bundle.name}`}>{m.community_add_short()}</Button
		>
	</div>
	{#if bundle.description}
		<p class="line-clamp-2 text-body-medium">{bundle.description}</p>
	{/if}
	<div class="mt-auto grid gap-1.5 pt-1 text-body-small text-on-surface-variant">
		<div class="flex min-w-0 items-center gap-2.5">
			<AppStack apps={bundle.apps} {names} />
			<span class="truncate">{appsText(bundle, names)}</span>
		</div>
		<p>
			{m.patcher_patch_count({ count: bundle.patches })} · {m.community_updated({
				date: shortDate(bundle.published_at),
			})}
		</p>
	</div>
</article>
