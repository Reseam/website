<script lang="ts">
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Package from '@lucide/svelte/icons/package';
	import Button from '#lib/components/ui/Button.svelte';
	import Panel from '#lib/components/ui/Panel.svelte';
	import PanelHeader from '#lib/components/ui/PanelHeader.svelte';
	import { plural } from '#lib/format.ts';
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
					apk.component_count > 1 && plural(apk.component_count, 'APK'),
				]
					.filter(Boolean)
					.join(' · ')
			: reading
				? 'Reading the app…'
				: 'Waiting for patches'}
	>
		{#snippet aside()}
			<Button variant="outline" size="sm" onclick={() => patcher.clearApp()}>Change</Button>
		{/snippet}
	</PanelHeader>
</Panel>
