<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import Button from '#lib/components/ui/Button.svelte';
	import Panel from '#lib/components/ui/Panel.svelte';
	import PanelHeader from '#lib/components/ui/PanelHeader.svelte';
	import PanelSection from '#lib/components/ui/PanelSection.svelte';
	import type { Patcher, Report } from '#lib/patcher/patcher.svelte.ts';
	import RunReport from './RunReport.svelte';

	let {
		patcher,
		message,
		report,
	}: {
		patcher: Patcher;
		message: string;
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
	/>
	<PanelSection class="grid grid-cols-1 gap-4">
		<p class="text-body-medium">{message}</p>
	</PanelSection>
	<PanelSection><RunReport {patcher} {report} /></PanelSection>
	<PanelSection class="flex flex-col-reverse gap-2 py-4 sm:flex-row sm:justify-end">
		<Button size="lg" onclick={() => patcher.edit()}>Back to patches</Button>
	</PanelSection>
</Panel>
