<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import Button from '#lib/components/ui/Button.svelte';
	import Panel from '#lib/components/ui/Panel.svelte';
	import PanelHeader from '#lib/components/ui/PanelHeader.svelte';
	import PanelSection from '#lib/components/ui/PanelSection.svelte';
	import { plural } from '#lib/format.ts';
	import type { Patcher, Report } from '#lib/patcher/patcher.svelte.ts';
	import RunReport from './RunReport.svelte';

	let {
		patcher,
		message,
		failed,
		report,
	}: {
		patcher: Patcher;
		message: string;
		failed: { reference: string; reason: string }[];
		report: Report;
	} = $props();

	const apk = $derived(patcher.inspection?.apk);
</script>

<Panel labelledby="failed-title">
	<PanelHeader
		id="failed-title"
		icon={CircleAlert}
		tone="error"
		title="{apk?.application_label ?? apk?.package_name ?? 'The app'} could not be patched"
		subtitle={failed.length > 0 ? `${plural(failed.length, 'patch', 'patches')} failed` : undefined}
	/>
	<PanelSection class="grid grid-cols-1 gap-4">
		<p class="text-body-medium">{message}</p>
		{#if failed.length > 0}
			<ul
				class="divide-y divide-outline-variant rounded-md border border-outline-variant text-body-medium"
			>
				{#each failed as { reference, reason } (reference)}
					<li class="px-4 py-3">
						<p class="text-label-large">{patcher.patchName(reference)}</p>
						{#if reason}<p class="mt-1 line-clamp-3 break-words text-error">{reason}</p>{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</PanelSection>
	<PanelSection><RunReport {patcher} {report} /></PanelSection>
	<PanelSection class="flex flex-col-reverse gap-2 py-4 sm:flex-row sm:justify-end">
		<Button
			variant={failed.length > 0 ? 'ghost' : 'primary'}
			size="lg"
			onclick={() => patcher.edit()}>Back to patches</Button
		>
		{#if failed.length > 0}
			<Button
				size="lg"
				onclick={() => patcher.retryWithout(failed.map((entry) => entry.reference))}
			>
				Patch without {failed.length === 1 ? 'it' : 'them'}
			</Button>
		{/if}
	</PanelSection>
</Panel>
