<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { ArrowRight, GitBranch } from 'lucide-svelte';
	import Button from '$lib/components/Button.svelte';
	import HeroPhone from '$lib/components/HeroPhone.svelte';
	import HowItWorks from '$lib/components/HowItWorks.svelte';

	const totalSteps = 6;
	let step = $state(0);
	let timer: ReturnType<typeof setInterval> | null = null;

	onMount(() => {
		timer = setInterval(() => {
			step = (step + 1) % totalSteps;
		}, 2200);
	});

	onDestroy(() => {
		if (timer) clearInterval(timer);
	});
</script>

<svelte:head>
	<title>Reseam — A better way to use your apps</title>
	<meta
		name="description"
		content="Easily add helpful new features or remove common annoyances from the apps you use every day."
	/>
</svelte:head>

<div class="px-6 py-16 lg:py-24">
	<div in:fly={{ y: 20, duration: 600, easing: cubicOut }} class="max-w-6xl mx-auto w-full">
		<div class="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-10">
			<div class="lg:flex-1 lg:max-w-sm text-center lg:text-left">
				<h1
					class="text-4xl sm:text-5xl font-bold mb-6 text-foreground tracking-tight leading-tight"
				>
					A better way to use your apps.
				</h1>
				<p class="text-lg text-muted-foreground mb-10 leading-relaxed">
					Easily add helpful new features or remove common annoyances from the apps you use every
					day. No technical skills required.
				</p>

				<div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
					<a href="/download/" class="w-full sm:w-auto">
						<Button size="lg" class="w-full sm:w-auto text-base rounded-[1rem] shadow-sm py-6 px-8">
							Get Reseam
							<ArrowRight class="ml-2" size={18} />
						</Button>
					</a>
					<a
						href="https://git.reseam.app"
						target="_blank"
						rel="noopener noreferrer"
						class="w-full sm:w-auto text-muted-foreground hover:text-foreground transition-colors inline-flex items-center justify-center h-12 px-6 font-medium text-sm"
					>
						<GitBranch class="mr-2" size={18} />
						View Source
					</a>
				</div>
			</div>

			<HeroPhone {step} />
		</div>
	</div>
</div>

<HowItWorks />
