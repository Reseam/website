<script lang="ts">
	import { CircleAlert } from 'lucide-svelte';
	import Button from '$lib/components/Button.svelte';
	import type { Patcher, Report } from '$lib/patcher/patcher.svelte';
	import Panel from './Panel.svelte';
	import PanelHeader from './PanelHeader.svelte';
	import PanelSection from './PanelSection.svelte';
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

	const label = $derived(
		patcher.inspection?.apk?.application_label ?? patcher.inspection?.apk?.package_name ?? 'The app'
	);
</script>

<Panel labelledby="failed-title">
	<PanelHeader
		id="failed-title"
		icon={CircleAlert}
		tone="error"
		title="{label} could not be patched"
		subtitle={failed.length > 0
			? `${failed.length} ${failed.length === 1 ? 'patch' : 'patches'} failed`
			: undefined}
	/>

	<PanelSection>
		<p class="text-sm">{message}</p>
		{#if failed.length > 0}
			<ul class="mt-4 divide-y divide-border rounded-[0.875rem] border border-border text-sm">
				{#each failed as { reference, reason } (reference)}
					<li class="px-4 py-3">
						<p class="font-medium">{patcher.patchName(reference)}</p>
						{#if reason}
							<p class="mt-1 line-clamp-3 break-words text-muted-foreground">{reason}</p>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</PanelSection>

	<PanelSection>
		<RunReport {patcher} {report} />
	</PanelSection>

	<PanelSection class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
		<Button variant={failed.length > 0 ? 'outlined' : 'default'} onclick={() => patcher.edit()}>
			Back to patches
		</Button>
		{#if failed.length > 0}
			<Button onclick={() => patcher.retryWithout(failed.map((entry) => entry.reference))}>
				Patch without {failed.length === 1 ? 'it' : 'them'}
			</Button>
		{/if}
	</PanelSection>
</Panel>
