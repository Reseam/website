<script lang="ts">
	import { LoaderCircle, Package } from 'lucide-svelte';
	import Button from '$lib/components/Button.svelte';
	import type { Patcher } from '$lib/patcher/patcher.svelte';
	import Panel from './Panel.svelte';
	import PanelHeader from './PanelHeader.svelte';
	import SourceList from './SourceList.svelte';

	let { patcher, file }: { patcher: Patcher; file: File } = $props();

	const apk = $derived(patcher.inspection?.apk);
	const reading = $derived(patcher.phase.name === 'reading');
	const subtitle = $derived(
		apk
			? [
					apk.version_name && `Version ${apk.version_name}`,
					apk.package_name,
					apk.component_count > 1 && `${apk.component_count} APKs`,
				]
					.filter(Boolean)
					.join(' · ')
			: reading
				? 'Reading app…'
				: 'Waiting for patches'
	);
</script>

<Panel labelledby="app-title">
	<PanelHeader
		id="app-title"
		icon={reading ? LoaderCircle : Package}
		spinning={reading}
		tone={apk ? 'primary' : 'muted'}
		title={apk ? (apk.application_label ?? apk.package_name ?? file.name) : file.name}
		{subtitle}
	>
		{#snippet actions()}
			<Button variant="ghost" size="sm" onclick={() => patcher.clearApp()}>Change</Button>
		{/snippet}
	</PanelHeader>
	<div class="border-t border-border">
		<SourceList {patcher} />
	</div>
</Panel>
