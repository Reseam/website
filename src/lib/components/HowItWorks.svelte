<script lang="ts">
	import { Smartphone, Download, Sparkles, PackageCheck } from 'lucide-svelte';
	import { cn } from '$lib/cn';

	const sampleToggles: Array<[string, boolean]> = [
		['Block Ads', true],
		['AMOLED Dark', true],
		['No Tracking', false],
	];
</script>

<section class="border-t border-border bg-muted/20">
	<div class="max-w-6xl mx-auto px-6 py-20 lg:py-28">
		<div class="text-center max-w-2xl mx-auto mb-16">
			<h2 class="text-3xl sm:text-4xl font-bold tracking-tight mb-4">How it works</h2>
			<p class="text-lg text-muted-foreground leading-relaxed">
				The patch engine runs on your phone. Nothing about your apps leaves the device.
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
			<div class="flex flex-col items-center text-center">
				<div class="h-40 mb-8 flex items-center justify-center">
					<div class="relative">
						<div
							class="w-20 h-32 rounded-[1.25rem] border-[5px] border-zinc-800 bg-zinc-950 flex items-center justify-center shadow-xl"
						>
							<Smartphone class="text-primary" size={28} />
						</div>
						<div
							class="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg ring-4 ring-background"
						>
							<Download size={14} />
						</div>
					</div>
				</div>
				<span class="text-xs font-semibold text-primary tracking-[0.2em] uppercase mb-3"
					>Step 01</span
				>
				<h3 class="text-xl font-semibold mb-3">Install the Reseam Manager</h3>
				<p class="text-muted-foreground leading-relaxed">
					Reseam Manager is an Android app. Install it once and the patch engine lives on your
					phone.
				</p>
			</div>

			<div class="flex flex-col items-center text-center">
				<div class="h-40 mb-8 flex items-center justify-center">
					<div
						class="bg-card border border-border rounded-2xl p-4 shadow-xl w-48 flex flex-col gap-3"
					>
						{#each sampleToggles as [name, on] (name)}
							<div class="flex items-center justify-between gap-3">
								<span class="text-xs font-medium text-foreground">{name}</span>
								<div
									class={cn(
										'w-8 h-5 rounded-full p-0.5 flex items-center transition-colors',
										on ? 'bg-primary justify-end' : 'bg-muted justify-start border border-border'
									)}
								>
									<div
										class={cn(
											'w-3.5 h-3.5 rounded-full',
											on ? 'bg-primary-foreground' : 'bg-muted-foreground'
										)}
									></div>
								</div>
							</div>
						{/each}
					</div>
				</div>
				<span class="text-xs font-semibold text-primary tracking-[0.2em] uppercase mb-3"
					>Step 02</span
				>
				<h3 class="text-xl font-semibold mb-3">Pick your patches</h3>
				<p class="text-muted-foreground leading-relaxed">
					Browse community-built patches for the apps you already use. Toggle the ones you want.
				</p>
			</div>

			<div class="flex flex-col items-center text-center">
				<div class="h-40 mb-8 flex items-center justify-center">
					<div class="relative">
						<div
							class="w-20 h-32 rounded-[1.25rem] border-[5px] border-zinc-800 bg-zinc-950 flex flex-col items-center gap-2 p-2.5 shadow-xl"
						>
							<div
								class="w-5 h-5 rounded-full bg-blue-500/30 mt-1.5 flex items-center justify-center"
							>
								<div class="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
							</div>
							<div class="w-full h-1.5 rounded-full bg-zinc-800"></div>
							<div class="w-3/4 h-1.5 rounded-full bg-zinc-800"></div>
							<div class="w-2/3 h-1.5 rounded-full bg-zinc-800 mt-auto"></div>
						</div>
						<div class="absolute -top-3 -right-3 text-primary">
							<Sparkles size={22} class="animate-pulse" />
						</div>
						<div
							class="absolute -bottom-1 -left-2 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg ring-4 ring-background"
						>
							<PackageCheck size={14} />
						</div>
					</div>
				</div>
				<span class="text-xs font-semibold text-primary tracking-[0.2em] uppercase mb-3"
					>Step 03</span
				>
				<h3 class="text-xl font-semibold mb-3">Install the patched APK</h3>
				<p class="text-muted-foreground leading-relaxed">
					Reseam builds and signs the APK on-device. The new app installs alongside the original.
				</p>
			</div>
		</div>
	</div>
</section>
