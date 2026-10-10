<script lang="ts">
	import WandSparkles from '@lucide/svelte/icons/wand-sparkles';
	import Button from '#lib/components/ui/Button.svelte';
	import { plural } from '#lib/format.ts';
	import type { Patcher } from '#lib/patcher/patcher.svelte.ts';
	import { reference } from '#lib/patcher/selection.ts';

	let { patcher }: { patcher: Patcher } = $props();

	const apk = $derived(patcher.inspection?.apk);
	const selected = $derived(
		patcher.listed.filter((patch) => patcher.running.has(reference(patch))).length
	);
</script>

<div
	class="sticky bottom-4 z-10 flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-low py-3 pr-3 pl-5 shadow-elevation-3 sm:flex-row sm:items-center"
>
	<p class="flex-1 text-body-medium text-on-surface-variant" aria-live="polite">
		{patcher.blocker ?? `${plural(selected, 'patch', 'patches')} selected`}
	</p>
	<Button size="lg" disabled={patcher.blocker !== null} onclick={() => patcher.patch()}>
		<WandSparkles size={17} /> Patch {apk?.application_label ?? apk?.package_name ?? 'app'}
	</Button>
</div>
