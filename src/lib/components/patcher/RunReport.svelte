<script lang="ts">
	import { Check, CircleSlash, Copy, X } from 'lucide-svelte';
	import { cn } from '$lib/cn';
	import { duration } from '$lib/format';
	import { STAGES, type Patcher, type Report } from '$lib/patcher/patcher.svelte';

	let { patcher, report }: { patcher: Patcher; report: Report } = $props();

	// One shade per stage, in run order, so the bar and its legend read together.
	const shades = ['bg-primary', 'bg-primary/75', 'bg-primary/55', 'bg-primary/35', 'bg-primary/20'];
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

<div>
	<div class="flex items-baseline justify-between gap-4 text-sm">
		<h3 class="font-medium">Time</h3>
		<span class="tabular-nums text-muted-foreground">{duration(report.milliseconds)} total</span>
	</div>
	<div class="mt-3 flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
		{#each stages as { stage, milliseconds } (stage)}
			<div class={shade(stage)} style:flex-grow={milliseconds}></div>
		{/each}
	</div>
	<ul class="mt-3 space-y-1.5 text-sm">
		{#each stages as { stage, milliseconds } (stage)}
			<li class="flex items-center gap-2.5">
				<span class={cn('size-2 shrink-0 rounded-full', shade(stage))}></span>
				<span class="flex-1 text-muted-foreground">{label(stage)}</span>
				<span class="tabular-nums">{duration(milliseconds)}</span>
			</li>
		{/each}
	</ul>

	<details class="group mt-5 text-sm">
		<summary
			class="cursor-pointer select-none text-muted-foreground transition-colors hover:text-foreground"
		>
			Details
		</summary>
		{#if report.patches.length > 0}
			<ul class="mt-3 divide-y divide-border rounded-[0.875rem] border border-border">
				{#each report.patches as run (run.reference)}
					<li class="flex items-start gap-3 px-4 py-2.5">
						{#if run.status.kind === 'applied'}
							<Check size={15} class="mt-0.5 shrink-0 text-primary" />
						{:else if run.status.kind === 'skipped'}
							<CircleSlash size={15} class="mt-0.5 shrink-0 text-muted-foreground" />
						{:else}
							<X size={15} class="mt-0.5 shrink-0 text-error" />
						{/if}
						<span class="min-w-0 flex-1">
							<span class="block truncate">{patcher.patchName(run.reference)}</span>
							{#if run.status.kind !== 'applied'}
								<span class="line-clamp-2 break-words text-xs text-muted-foreground"
									>{run.status.reason}</span
								>
							{/if}
						</span>
					</li>
				{/each}
			</ul>
		{/if}
		<div class="relative mt-3">
			<pre
				class="max-h-72 overflow-auto rounded-[0.875rem] border border-border bg-background p-4 pr-12 font-mono text-xs leading-relaxed text-muted-foreground">{patcher.log.join(
					'\n'
				)}</pre>
			<button
				type="button"
				onclick={copy}
				aria-label="Copy log"
				class="absolute right-2 top-2 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
			>
				{#if copied}<Check size={14} />{:else}<Copy size={14} />{/if}
			</button>
		</div>
	</details>
</div>
