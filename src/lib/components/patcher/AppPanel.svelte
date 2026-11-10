<script lang="ts">
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Package from '@lucide/svelte/icons/package';
	import Button from '#lib/components/ui/Button.svelte';
	import Panel from '#lib/components/ui/Panel.svelte';
	import PanelHeader from '#lib/components/ui/PanelHeader.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import type { Patcher } from '#lib/patcher/patcher.svelte.ts';

	let { patcher, file }: { patcher: Patcher; file: File } = $props();

	const apk = $derived(patcher.inspection?.apk);
	const reading = $derived(patcher.phase.name === 'reading');
</script>

<Panel labelledby="app-title">
	<PanelHeader
		id="app-title"
		icon={reading ? LoaderCircle : Package}
		spinning={reading}
		tone={apk ? 'primary' : 'muted'}
		title={apk ? (apk.application_label ?? apk.package_name ?? file.name) : file.name}
		subtitle={apk
			? [
					apk.version_name,
					apk.package_name,
					apk.component_count > 1 && m.patcher_apk_count({ count: apk.component_count }),
				]
					.filter(Boolean)
					.join(' · ')
			: reading
				? m.patcher_reading()
				: m.patcher_waiting()}
	>
		{#snippet aside()}
			<Button variant="outline" size="sm" onclick={() => patcher.clearApp()}
				>{m.action_change()}</Button
			>
		{/snippet}
	</PanelHeader>
</Panel>
