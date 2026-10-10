<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import CircleSlash from '@lucide/svelte/icons/circle-slash';
	import Copy from '@lucide/svelte/icons/copy';
	import X from '@lucide/svelte/icons/x';
	import { Collapsible } from 'bits-ui';
	import { buttonClass } from '#lib/components/ui/button.ts';
	import { duration } from '#lib/format.ts';
	import { STAGES, type Patcher, type Report } from '#lib/patcher/patcher.svelte.ts';

	let { patcher, report }: { patcher: Patcher; report: Report } = $props();

	// One shade per stage, in run order, so the bar and its legend read together.
	const shades = ['opacity-100', 'opacity-80', 'opacity-60', 'opacity-40', 'opacity-25'];
	const shade = (stage: string) => shades[STAGES.findIndex((entry) => entry.stage === stage)];
	const label = (stage: string) => STAGES.find((entry) => entry.stage === stage)!.label;
	// Stages that took no measurable time, such as a Java runtime already started, are noise here.
	const stages = $derived(report.stages.filter((entry) => entry.milliseconds >= 100));

	let copied = $state(false);
	async function copy() {
		await navigator.clipboard.writeText(patcher.log.join('\n'));
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="grid grid-cols-1 gap-3">
	<div class="flex items-baseline justify-between gap-4">
		<h3 class="text-label-large">Time</h3>
		<span class="text-body-medium text-on-surface-variant tabular-nums"
			>{duration(report.milliseconds)} total</span
		>
	</div>
	<div class="flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
		{#each stages as { stage, milliseconds } (stage)}<div
				class="bg-primary {shade(stage)}"
				style:flex-grow={milliseconds}
			></div>{/each}
	</div>
	<ul class="grid gap-1.5 text-body-medium">
		{#each stages as { stage, milliseconds } (stage)}
			<li class="flex items-center gap-2.5">
				<span class="size-2 shrink-0 rounded-full bg-primary {shade(stage)}"></span>
				<span class="flex-1 text-on-surface-variant">{label(stage)}</span>
				<span class="tabular-nums">{duration(milliseconds)}</span>
			</li>
		{/each}
	</ul>
	<Collapsible.Root>
		<Collapsible.Trigger
			class="group mt-2 inline-flex items-center gap-1 text-body-medium text-on-surface-variant transition-colors hover:text-on-surface"
		>
			Details <ChevronDown
				size={14}
				class="transition-transform duration-200 group-aria-expanded:rotate-180"
			/>
		</Collapsible.Trigger>
		<Collapsible.Content class="collapsible">
			<div class="grid grid-cols-1 gap-3 pt-3">
				{#if report.patches.length > 0}
					<ul
						class="divide-y divide-outline-variant rounded-md border border-outline-variant text-body-medium"
					>
						{#each report.patches as run (run.reference)}
							<li class="flex items-start gap-3 px-4 py-2.5">
								{#if run.status.kind === 'applied'}<Check
										size={15}
										class="mt-0.5 shrink-0 text-primary"
									/>
								{:else if run.status.kind === 'skipped'}<CircleSlash
										size={15}
										class="mt-0.5 shrink-0 text-on-surface-variant"
									/>
								{:else}<X size={15} class="mt-0.5 shrink-0 text-error" />{/if}
								<span class="min-w-0 flex-1">
									<span class="block truncate">{patcher.patchName(run.reference)}</span>
									{#if run.status.kind !== 'applied'}<span
											class="line-clamp-2 text-body-small break-words text-on-surface-variant"
											>{run.status.reason}</span
										>{/if}
								</span>
							</li>
						{/each}
					</ul>
				{/if}
				<div class="relative">
					<pre
						class="max-h-72 overflow-auto rounded-md border border-outline-variant bg-surface p-4 pr-12 font-mono text-mono-xs text-on-surface-variant">{patcher.log.join(
							'\n'
						)}</pre>
					<button
						type="button"
						onclick={copy}
						aria-label={copied ? 'Copied' : 'Copy log'}
						class="absolute top-2 right-2 {buttonClass('ghost', 'icon-sm')}"
					>
						{#if copied}<Check size={14} />{:else}<Copy size={14} />{/if}
					</button>
				</div>
			</div>
		</Collapsible.Content>
	</Collapsible.Root>
</div>
