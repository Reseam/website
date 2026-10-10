<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Button from '#lib/components/ui/Button.svelte';
	import Panel from '#lib/components/ui/Panel.svelte';
	import PanelHeader from '#lib/components/ui/PanelHeader.svelte';
	import PanelSection from '#lib/components/ui/PanelSection.svelte';
	import ProgressBar from '#lib/components/ui/Progress.svelte';
	import { duration, plural } from '#lib/format.ts';
	import { STAGES, type Patcher, type Stage } from '#lib/patcher/patcher.svelte.ts';

	let {
		patcher,
		stage,
		marks,
		finished,
		total,
		current,
	}: {
		patcher: Patcher;
		stage: Stage;
		marks: Partial<Record<Stage, number>>;
		finished: number;
		total: number;
		current: string | null;
	} = $props();

	const apk = $derived(patcher.inspection?.apk);
	const index = $derived(STAGES.findIndex((entry) => entry.stage === stage));
	const percent = $derived(stage === 'applying' && total > 0 ? (finished / total) * 100 : null);

	// The run started when this view mounted; marks are offsets from that moment.
	const started = performance.now();
	let now = $state(0);
	$effect(() => {
		const timer = setInterval(() => (now = performance.now() - started), 250);
		return () => clearInterval(timer);
	});

	function spent(position: number): number | null {
		const begin = marks[STAGES[position].stage];
		if (begin === undefined) return null;
		const next = STAGES.slice(position + 1).find((entry) => marks[entry.stage] !== undefined);
		return (next ? marks[next.stage]! : now) - begin;
	}
</script>

<Panel labelledby="progress-title">
	<PanelHeader
		id="progress-title"
		icon={LoaderCircle}
		spinning
		title="Patching {apk?.application_label ?? apk?.package_name ?? 'app'}"
		subtitle={[
			apk?.version_name && `Version ${apk.version_name}`,
			plural(total, 'patch', 'patches'),
		]
			.filter(Boolean)
			.join(' · ')}
	>
		{#snippet aside()}<span
				class="font-mono text-mono-sm text-on-surface-variant tabular-nums"
				aria-hidden="true">{duration(now)}</span
			>{/snippet}
	</PanelHeader>
	<PanelSection class="grid gap-5">
		<ProgressBar value={percent} label="Patching progress" />
		<ol class="grid gap-3.5 text-body-large" aria-live="polite">
			{#each STAGES as entry, position (entry.stage)}
				{@const time = spent(position)}
				<li class="grid grid-cols-[1.25rem_1fr_auto] items-start gap-3.5">
					<span class="grid h-6 place-items-center">
						{#if position < index}<Check size={16} strokeWidth={2.8} class="text-primary" />
						{:else if position === index}<LoaderCircle
								size={16}
								class="animate-spin text-primary"
							/>
						{:else}<span class="size-1.5 rounded-full bg-outline-variant"></span>{/if}
					</span>
					<span class="min-w-0">
						<span class={position > index ? 'text-on-surface-variant' : undefined}
							>{entry.label}</span
						>
						{#if entry.stage === 'applying' && position === index}
							<span class="block truncate text-body-medium text-on-surface-variant"
								>{finished} of {total}{current ? ` · ${current}` : ''}</span
							>
						{/if}
					</span>
					{#if time !== null && (position === index || time >= 100)}
						<span
							class={[
								'text-body-medium tabular-nums',
								position === index ? 'text-on-surface' : 'text-on-surface-variant',
							]}>{duration(time)}</span
						>
					{/if}
				</li>
			{/each}
		</ol>
	</PanelSection>
	<PanelSection class="flex justify-end py-4">
		<Button variant="outline" size="lg" onclick={() => patcher.cancel()}>Cancel</Button>
	</PanelSection>
</Panel>
