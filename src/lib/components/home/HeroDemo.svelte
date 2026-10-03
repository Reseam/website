<script lang="ts">
	import Play from '@lucide/svelte/icons/play';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Smartphone from '@lucide/svelte/icons/smartphone';
	import { onMount } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';
	import { fly, scale, slide } from 'svelte/transition';
	import { Label } from 'bits-ui';
	import Switch from '#lib/components/ui/Switch.svelte';

	const patches = $state([
		{ id: 'ads', label: 'Block ads', on: false },
		{ id: 'dark', label: 'AMOLED dark', on: false },
		{ id: 'play', label: 'Background play', on: false },
		{ id: 'tracking', label: 'No tracking', on: false },
	]);
	const on = (id: string) => patches.find((patch) => patch.id === id)!.on;

	let playing = $state(true);

	onMount(() => {
		if (prefersReducedMotion.current) {
			playing = false;
			for (const patch of patches) patch.on = true;
			return;
		}
		let step = 0;
		const timer = setInterval(() => {
			if (!playing) return clearInterval(timer);
			step = (step + 1) % (patches.length + 2);
			patches.forEach((patch, index) => (patch.on = step > index));
		}, 2200);
		return () => clearInterval(timer);
	});
</script>

{#snippet screen(app: string, dot: string, halo: string)}
	<span
		class="absolute inset-x-0 top-0 mx-auto h-4 w-20 rounded-b-md bg-(--line) transition-colors duration-700"
	></span>
	<div class="mt-6 mb-3 flex items-center gap-3 px-1">
		<span class="grid size-8 place-items-center rounded-full {halo}"
			><span class="size-4 rounded-full {dot}"></span></span
		>
		<span class="grid flex-1 gap-1.5">
			<b class="text-[11px] leading-none text-(--ink) transition-colors duration-700">{app}</b>
			<span class="h-2 w-20 rounded-full bg-(--line) transition-colors duration-700"></span>
		</span>
	</div>
{/snippet}

{#snippet feed()}
	<div
		class="flex flex-1 flex-col gap-3 rounded-lg bg-(--panel) p-3 transition-colors duration-700"
	>
		<div class="aspect-2/1 rounded-sm bg-(--line) transition-colors duration-700"></div>
		<div class="h-3 w-3/4 shrink-0 rounded-full bg-(--line) transition-colors duration-700"></div>
		<div class="h-3 w-1/2 shrink-0 rounded-full bg-(--line) transition-colors duration-700"></div>
	</div>
{/snippet}

<div class="relative mx-auto h-[33rem] w-full max-w-xl select-none sm:h-[28rem]">
	<div
		aria-hidden="true"
		class="dark-phone absolute top-6 left-1/2 hidden h-88 w-56 -translate-x-[calc(50%+170px)] -rotate-6 flex-col overflow-hidden rounded-2xl border-6 border-(--line) bg-(--screen) p-3 shadow-float sm:flex"
	>
		{@render screen('App 2', 'bg-app-violet', 'bg-app-violet/25')}
		{@render feed()}
	</div>

	<div
		aria-hidden="true"
		class={[
			'absolute top-6 left-1/2 z-10 flex h-80 w-48 -translate-x-1/2 flex-col overflow-hidden rounded-2xl border-6 border-(--line) bg-(--screen) p-3 shadow-float transition-colors duration-700 sm:h-88 sm:w-56 sm:-translate-x-[calc(50%+90px)]',
			on('dark') ? 'dark-phone' : 'light-phone',
		]}
	>
		{@render screen('App 1', 'bg-app-blue', 'bg-app-blue/20')}
		{#if on('tracking')}
			<span
				in:scale={{ start: 0.6, duration: 280, easing: cubicOut }}
				class="absolute top-9 right-4 grid size-6 place-items-center rounded-full bg-primary/20 text-primary"
			>
				<ShieldCheck size={12} />
			</span>
		{/if}
		{#if !on('ads')}
			<div transition:slide={{ duration: 400 }} class="shrink-0">
				<div
					class="mb-3 grid justify-items-center gap-1.5 rounded-lg border border-error/30 bg-error/10 p-2.5"
				>
					<span class="text-[9px] font-bold tracking-widest text-error uppercase">Sponsored ad</span
					>
					<span class="h-9 w-full rounded-sm bg-error/25"></span>
				</div>
			</div>
		{/if}
		{@render feed()}
		{#if on('play')}
			<div
				in:fly={{ y: 16, duration: 350, easing: cubicOut }}
				class="absolute inset-x-2 bottom-2 flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-primary-foreground shadow-float"
			>
				<span class="grid size-6 place-items-center rounded-sm bg-primary-foreground/20"
					><Play size={10} fill="currentColor" /></span
				>
				<span class="grid flex-1 gap-1"
					><span class="h-2 w-3/4 rounded-full bg-primary-foreground/40"></span><span
						class="h-1.5 w-1/2 rounded-full bg-primary-foreground/25"
					></span></span
				>
			</div>
		{/if}
	</div>

	<div
		class="absolute bottom-0 left-1/2 z-20 w-60 -translate-x-1/2 rounded-xl border border-border bg-card/95 p-5 shadow-float backdrop-blur-xl sm:top-1/2 sm:bottom-auto sm:translate-x-[calc(-50%+150px)] sm:-translate-y-1/2"
	>
		<p class="mb-3 flex items-center gap-2 border-b border-border pb-3 text-sm font-semibold">
			<span class="grid size-6 place-items-center rounded-sm bg-primary/20 text-primary"
				><Smartphone size={14} /></span
			>
			Apply patches
		</p>
		<ul class="grid gap-1">
			{#each patches as patch (patch.id)}
				<li class="flex items-center justify-between gap-4 py-1">
					<Label.Root for="demo-{patch.id}" class="text-sm font-medium">{patch.label}</Label.Root>
					<Switch
						id="demo-{patch.id}"
						bind:checked={patch.on}
						onCheckedChange={() => (playing = false)}
					/>
				</li>
			{/each}
		</ul>
		<p
			class={[
				'mt-2 text-center text-xs text-muted-foreground transition-opacity duration-300',
				!playing && 'opacity-0',
			]}
		>
			Try the switches
		</p>
	</div>
</div>

<style>
	.light-phone {
		--screen: var(--color-phone-light);
		--panel: oklch(1 0 0);
		--line: var(--color-phone-light-line);
		--ink: var(--color-phone-dark-line);
	}
	.dark-phone {
		--screen: var(--color-phone-dark);
		--panel: color-mix(in oklch, var(--color-phone-dark-line) 40%, transparent);
		--line: var(--color-phone-dark-line);
		--ink: var(--color-phone-light-line);
	}
</style>
