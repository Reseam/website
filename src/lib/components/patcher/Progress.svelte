<script lang="ts">
	import { Check, LoaderCircle } from 'lucide-svelte';
	import Button from '$lib/components/Button.svelte';
	import { cn } from '$lib/cn';
	import { duration } from '$lib/format';
	import { STAGES, type Patcher, type Stage } from '$lib/patcher/patcher.svelte';
	import Panel from './Panel.svelte';
	import PanelHeader from './PanelHeader.svelte';
	import PanelSection from './PanelSection.svelte';

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
	const label = $derived(apk?.application_label ?? apk?.package_name ?? 'app');
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
		tone="primary"
		title="Patching {label}"
		subtitle={[
			apk?.version_name && `Version ${apk.version_name}`,
			`${total} ${total === 1 ? 'patch' : 'patches'}`,
		]
			.filter(Boolean)
			.join(' · ')}
	>
		{#snippet actions()}
			<span class="font-mono text-sm tabular-nums text-muted-foreground" aria-hidden="true"
				>{duration(now)}</span
			>
		{/snippet}
	</PanelHeader>

	<PanelSection>
		<div
			class="h-1.5 overflow-hidden rounded-full bg-muted"
			role="progressbar"
			aria-label="Patching progress"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={percent === null ? undefined : Math.round(percent)}
		>
			{#if percent === null}
				<div class="indeterminate h-full w-1/3 rounded-full bg-primary"></div>
			{:else}
				<div
					class="h-full rounded-full bg-primary transition-[width] duration-300"
					style:width="{percent}%"
				></div>
			{/if}
		</div>

		<ol class="mt-5 space-y-3 text-sm" aria-live="polite">
			{#each STAGES as entry, position (entry.stage)}
				{@const time = spent(position)}
				<li class="flex items-start gap-3">
					<span class="flex size-5 shrink-0 items-center justify-center">
						{#if position < index}
							<Check size={16} class="text-primary" />
						{:else if position === index}
							<LoaderCircle size={16} class="animate-spin text-primary" />
						{:else}
							<span class="size-1.5 rounded-full bg-border"></span>
						{/if}
					</span>
					<span class="min-w-0 flex-1">
						<span class={position > index ? 'text-muted-foreground' : undefined}>{entry.label}</span
						>
						{#if entry.stage === 'applying' && position === index}
							<span class="block truncate text-xs text-muted-foreground">
								{finished} of {total}{current ? ` · ${current}` : ''}
							</span>
						{/if}
					</span>
					{#if time !== null && (position === index || time >= 100)}
						<span
							class={cn(
								'shrink-0 tabular-nums',
								position === index ? 'text-foreground' : 'text-muted-foreground'
							)}>{duration(time)}</span
						>
					{/if}
				</li>
			{/each}
		</ol>
	</PanelSection>

	<PanelSection class="flex justify-end">
		<Button variant="outlined" class="w-full sm:w-auto" onclick={() => patcher.cancel()}
			>Cancel</Button
		>
	</PanelSection>
</Panel>

<style>
	.indeterminate {
		animation: slide 1.4s ease-in-out infinite;
	}
	@keyframes slide {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(300%);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.indeterminate {
			animation: none;
			width: 100%;
			opacity: 0.4;
		}
	}
</style>
