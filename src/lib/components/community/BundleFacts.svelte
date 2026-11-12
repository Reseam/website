<script lang="ts">
	import Globe from '@lucide/svelte/icons/globe';
	import { fingerprint } from '#lib/community.ts';
	import Forgejo from '#lib/components/brand/Forgejo.svelte';
	import GitHub from '#lib/components/brand/GitHub.svelte';
	import { shortDate } from '#lib/format.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { SOURCE_URL } from '#lib/site.ts';
	import type { CommunityBundle } from '#lib/types.ts';

	let { bundle }: { bundle: CommunityBundle } = $props();

	const source = $derived(new URL(bundle.repository));
	const SourceIcon = $derived(
		source.host === 'github.com' ? GitHub : source.origin === SOURCE_URL ? Forgejo : Globe
	);
</script>

<dl
	class="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-outline-variant bg-outline-variant sm:grid-cols-4"
>
	<div class="grid gap-1 bg-surface-container-low px-4 py-3">
		<dt class="text-label-medium text-on-surface-variant">{m.community_version()}</dt>
		<dd class="text-body-medium tabular-nums">{bundle.version}</dd>
	</div>
	<div class="grid gap-1 bg-surface-container-low px-4 py-3">
		<dt class="text-label-medium text-on-surface-variant">{m.community_published()}</dt>
		<dd class="text-body-medium">
			<time datetime={bundle.published_at}>{shortDate(bundle.published_at)}</time>
		</dd>
	</div>
	<div class="grid gap-1 bg-surface-container-low px-4 py-3">
		<dt class="text-label-medium text-on-surface-variant">{m.community_key()}</dt>
		<dd class="font-mono text-mono-sm" title={bundle.public_key}>
			{fingerprint(bundle.public_key)}
		</dd>
	</div>
	<div class="grid min-w-0 gap-1 bg-surface-container-low px-4 py-3">
		<dt class="text-label-medium text-on-surface-variant">{m.community_source()}</dt>
		<dd class="min-w-0">
			<a
				href={bundle.repository}
				rel="noopener"
				target="_blank"
				class="inline-flex max-w-full items-center gap-1.5 text-body-medium hover:text-primary"
			>
				<SourceIcon size={14} />
				<span class="truncate">{source.host}</span>
			</a>
		</dd>
	</div>
</dl>
