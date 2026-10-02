<script lang="ts">
	import { Wand2 } from 'lucide-svelte';
	import Button from '$lib/components/Button.svelte';
	import type { Patcher } from '$lib/patcher/patcher.svelte';
	import { reference } from '$lib/patcher/selection';

	let { patcher }: { patcher: Patcher } = $props();

	const label = $derived(
		patcher.inspection?.apk?.application_label ?? patcher.inspection?.apk?.package_name ?? 'app'
	);
	const selected = $derived(
		patcher.listed.filter((patch) => patcher.running.has(reference(patch))).length
	);
</script>

<div
	class="sticky bottom-4 z-10 mt-4 flex flex-col gap-3 rounded-[1.25rem] border border-border bg-card/90 px-5 py-4 shadow-lg backdrop-blur-md sm:flex-row sm:items-center sm:px-6"
>
	<p class="flex-1 text-sm text-muted-foreground" aria-live="polite">
		{patcher.blocker ?? `${selected} ${selected === 1 ? 'patch' : 'patches'} selected`}
	</p>
	<Button
		class="w-full gap-2 sm:w-auto"
		disabled={patcher.blocker !== null}
		onclick={() => patcher.patch()}
	>
		<Wand2 size={16} /> Patch {label}
	</Button>
</div>
