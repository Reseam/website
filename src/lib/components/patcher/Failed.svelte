<script lang="ts">
	import { m } from '#lib/paraglide/messages.js';
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
	const name = $derived(apk?.application_label ?? apk?.package_name);
</script>

<Panel labelledby="failed-title">
	<PanelHeader
		id="failed-title"
		icon={CircleAlert}
		tone="error"
		title={name ? m.patcher_failed_named({ app: name }) : m.patcher_failed()}
	/>
	<PanelSection class="grid grid-cols-1 gap-4">
		<p class="text-body-medium">{message}</p>
	</PanelSection>
	<PanelSection><RunReport {patcher} {report} /></PanelSection>
	<PanelSection class="flex flex-col-reverse gap-2 py-4 sm:flex-row sm:justify-end">
		<Button size="lg" onclick={() => patcher.edit()}>{m.action_back_to_patches()}</Button>
	</PanelSection>
</Panel>
