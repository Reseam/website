<script lang="ts">
	import { scale, fly } from 'svelte/transition';
	import { Spring } from 'svelte/motion';
	import { cubicInOut, cubicOut } from 'svelte/easing';
	import { Sparkles, Smartphone, Play, ShieldCheck } from 'lucide-svelte';
	import { cn } from '$lib/cn';

	type Patch = { name: string; activeAt: number };

	let { step }: { step: number } = $props();

	const patches: Patch[] = [
		{ name: 'Block Ads', activeAt: 1 },
		{ name: 'AMOLED Dark', activeAt: 2 },
		{ name: 'Background Play', activeAt: 3 },
		{ name: 'No Tracking', activeAt: 4 },
	];

	const noAds = $derived(step >= 1);
	const isDark = $derived(step >= 2);
	const bgPlay = $derived(step >= 3);
	const noTracking = $derived(step >= 4);
	const anyActive = $derived(step >= 1);

	function adTransition(node: HTMLElement, { duration = 400 } = {}) {
		const height = node.scrollHeight;
		return {
			duration,
			easing: cubicInOut,
			css: (t: number) => `
				height: ${t * height}px;
				opacity: ${t};
				transform: scale(${0.9 + 0.1 * t});
				margin-bottom: ${t * 12}px;
				overflow: hidden;
			`,
		};
	}

	const toggles = patches.map(() => new Spring(0, { stiffness: 0.15, damping: 0.4 }));

	$effect(() => {
		patches.forEach((p, i) => {
			toggles[i].target = step >= p.activeAt ? 16 : 0;
		});
	});
</script>

<div class="w-full lg:flex-1 overflow-hidden">
	<div class="relative mx-auto w-full max-w-[36rem] h-[480px] sm:h-[440px]">
		<div
			class="absolute left-1/2 -translate-x-[calc(50%+170px)] top-6 z-0 hidden sm:block pointer-events-none -rotate-[6deg]"
		>
			<div
				class="w-56 h-[22rem] rounded-[2rem] border-[6px] border-zinc-800 bg-zinc-950 shadow-2xl flex flex-col p-3 overflow-hidden relative"
			>
				<div class="absolute top-0 inset-x-0 h-4 flex justify-center">
					<div class="w-20 h-full rounded-b-[0.75rem] bg-zinc-900"></div>
				</div>
				<div class="w-full flex items-center gap-3 mt-6 mb-4 px-1">
					<div
						class="w-8 h-8 rounded-full bg-violet-500/25 flex items-center justify-center shrink-0"
					>
						<div class="w-4 h-4 rounded-full bg-violet-500"></div>
					</div>
					<div class="flex-1 flex flex-col gap-1.5">
						<span class="text-[11px] font-semibold text-zinc-300 leading-none">App 2</span>
						<div class="h-2 w-20 rounded-full bg-zinc-800"></div>
					</div>
				</div>
				<div class="flex-1 rounded-xl p-3 flex flex-col gap-3 bg-zinc-900">
					<div class="w-full aspect-[2/1] rounded-lg bg-zinc-800"></div>
					<div class="w-3/4 h-3 rounded-full bg-zinc-800"></div>
					<div class="w-1/2 h-3 rounded-full bg-zinc-800"></div>
					<div class="w-full h-3 rounded-full bg-zinc-800 mt-auto"></div>
				</div>
			</div>
		</div>

		<div class="absolute left-1/2 -translate-x-1/2 sm:-translate-x-[calc(50%+90px)] top-6 z-10">
			<div
				class={cn(
					'w-48 sm:w-56 h-80 sm:h-[22rem] rounded-[2rem] border-[6px] shadow-2xl flex flex-col p-3 overflow-hidden transition-colors duration-700 relative',
					isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
				)}
			>
				<div class="absolute top-0 inset-x-0 h-4 flex justify-center z-10">
					<div
						class={cn(
							'w-20 h-full rounded-b-[0.75rem] transition-colors duration-700',
							isDark ? 'bg-zinc-900' : 'bg-zinc-200'
						)}
					></div>
				</div>

				<div class="w-full flex items-center gap-3 mt-6 mb-4 px-1">
					<div
						class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0"
					>
						<div class="w-4 h-4 rounded-full bg-blue-500"></div>
					</div>
					<div class="flex-1 flex flex-col gap-1.5">
						<span
							class={cn(
								'text-[11px] font-semibold leading-none transition-colors duration-700',
								isDark ? 'text-zinc-200' : 'text-zinc-700'
							)}
						>
							App 1
						</span>
						<div
							class={cn(
								'h-2 w-20 rounded-full transition-colors duration-700',
								isDark ? 'bg-zinc-800' : 'bg-zinc-200'
							)}
						></div>
					</div>
					{#if noTracking}
						<div
							in:scale={{
								duration: 280,
								start: 0.6,
								easing: cubicOut,
							}}
							class="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0"
							title="No tracking"
						>
							<ShieldCheck size={12} />
						</div>
					{/if}
				</div>

				{#if !noAds}
					<div
						transition:adTransition
						class="w-full bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex flex-col items-center justify-center shrink-0 origin-center"
					>
						<span
							class="text-[9px] font-bold text-destructive uppercase tracking-widest mb-1.5 inline-flex items-center gap-1"
						>
							Sponsored Ad
						</span>
						<div class="w-full h-10 bg-destructive/20 rounded-lg"></div>
					</div>
				{/if}

				<div
					class={cn(
						'flex-1 rounded-xl p-3 flex flex-col gap-3 transition-colors duration-700',
						isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100 shadow-sm'
					)}
				>
					<div
						class={cn(
							'w-full aspect-[2/1] rounded-lg transition-colors duration-700',
							isDark ? 'bg-zinc-800' : 'bg-zinc-100'
						)}
					></div>
					<div
						class={cn(
							'w-3/4 h-3 flex-shrink-0 rounded-full transition-colors duration-700',
							isDark ? 'bg-zinc-800' : 'bg-zinc-100'
						)}
					></div>
					<div
						class={cn(
							'w-1/2 h-3 flex-shrink-0 rounded-full transition-colors duration-700',
							isDark ? 'bg-zinc-800' : 'bg-zinc-100'
						)}
					></div>
					<div
						class={cn(
							'w-full h-3 flex-shrink-0 rounded-full transition-colors duration-700 mt-auto',
							isDark ? 'bg-zinc-800' : 'bg-zinc-100'
						)}
					></div>
				</div>

				{#if bgPlay}
					<div
						in:fly={{
							y: 16,
							duration: 350,
							easing: cubicOut,
						}}
						class="absolute left-2 right-2 bottom-2 bg-primary text-primary-foreground rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg z-20"
					>
						<div
							class="w-6 h-6 rounded-md bg-primary-foreground/20 flex items-center justify-center shrink-0"
						>
							<Play size={10} fill="currentColor" />
						</div>
						<div class="flex-1 min-w-0">
							<div class="h-2 w-3/4 rounded-full bg-primary-foreground/40"></div>
							<div class="h-1.5 w-1/2 rounded-full bg-primary-foreground/25 mt-1"></div>
						</div>
						<div class="flex items-center gap-0.5">
							<span class="w-0.5 h-2 bg-primary-foreground/60 rounded-full animate-pulse"></span>
							<span
								class="w-0.5 h-3 bg-primary-foreground/80 rounded-full animate-pulse"
								style:animation-delay="120ms"
							></span>
							<span
								class="w-0.5 h-2 bg-primary-foreground/50 rounded-full animate-pulse"
								style:animation-delay="240ms"
							></span>
						</div>
					</div>
				{/if}

				{#if anyActive}
					<div
						in:fly={{ y: 0, duration: 300 }}
						class="absolute -right-2 -top-2 w-16 h-16 pointer-events-none flex items-center justify-center text-primary z-20"
					>
						<Sparkles size={24} class="animate-pulse" />
					</div>
				{/if}
			</div>
		</div>

		<div
			class="absolute left-1/2 -translate-x-1/2 sm:-translate-x-[calc(50%-150px)] bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-20"
		>
			<div
				in:fly={{ y: 20, duration: 400, delay: 400 }}
				class="bg-card/95 backdrop-blur-xl border border-border p-5 rounded-[1.5rem] shadow-2xl w-56 flex flex-col gap-4 text-left"
			>
				<div class="flex items-center justify-between border-b border-border pb-3">
					<div class="flex items-center gap-2">
						<div class="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
							<Smartphone class="text-primary" size={14} />
						</div>
						<h3 class="text-sm font-semibold">Apply Patches</h3>
					</div>
					<div class="flex items-center gap-1">
						<span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
						<span class="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
						<span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
					</div>
				</div>
				<div class="space-y-3 pt-1">
					{#each patches as p, i (p.name)}
						{@const active = step >= p.activeAt}
						<div class="flex items-center justify-between gap-4">
							<span class="text-sm font-medium text-foreground">{p.name}</span>
							<div
								class={cn(
									'w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 shrink-0 border relative',
									active ? 'bg-primary border-primary' : 'bg-muted border-border'
								)}
							>
								<div
									style:transform="translateX({toggles[i].current}px)"
									class={cn(
										'w-4 h-4 rounded-full shadow-sm relative z-10',
										active ? 'bg-primary-foreground' : 'bg-muted-foreground'
									)}
								></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
