<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { fly, scale } from "svelte/transition";
    import { Spring } from "svelte/motion";
    import { cubicInOut, cubicOut } from "svelte/easing";
    import {
        ArrowRight,
        Sparkles,
        Smartphone,
        GitBranch,
        Play,
        ShieldCheck,
        Download,
        PackageCheck,
    } from "lucide-svelte";
    import Button from "$lib/components/Button.svelte";
    import { cn } from "$lib/cn";

    type Patch = { name: string; activeAt: number };

    const patches: Patch[] = [
        { name: "Block Ads", activeAt: 1 },
        { name: "AMOLED Dark", activeAt: 2 },
        { name: "Background Play", activeAt: 3 },
        { name: "No Tracking", activeAt: 4 },
    ];

    const totalSteps = patches.length + 2;
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

    const toggles = patches.map(
        () => new Spring(0, { stiffness: 0.15, damping: 0.4 }),
    );

    $effect(() => {
        patches.forEach((p, i) => {
            toggles[i].target = step >= p.activeAt ? 16 : 0;
        });
    });

    const sampleToggles: Array<[string, boolean]> = [
        ["Block Ads", true],
        ["AMOLED Dark", true],
        ["No Tracking", false],
    ];
</script>

<svelte:head>
    <title>Reseam — A better way to use your apps</title>
    <meta
        name="description"
        content="Easily add helpful new features or remove common annoyances from the apps you use every day."
    />
</svelte:head>

<div class="px-6 py-16 lg:py-24">
    <div
        in:fly={{ y: 20, duration: 600, easing: cubicOut }}
        class="max-w-6xl mx-auto w-full"
    >
        <div
            class="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-10"
        >
            <div class="lg:flex-1 lg:max-w-sm text-center lg:text-left">
                <h1
                    class="text-4xl sm:text-5xl font-bold mb-6 text-foreground tracking-tight leading-tight"
                >
                    A better way to use your apps.
                </h1>
                <p class="text-lg text-muted-foreground mb-10 leading-relaxed">
                    Easily add helpful new features or remove common annoyances
                    from the apps you use every day. No technical skills
                    required.
                </p>

                <div
                    class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                >
                    <a href="/download/" class="w-full sm:w-auto">
                        <Button
                            size="lg"
                            class="w-full sm:w-auto text-base rounded-[1rem] shadow-sm py-6 px-8"
                        >
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

            <div class="w-full lg:flex-1 overflow-hidden">
                <div
                    class="relative mx-auto w-full max-w-[36rem] h-[480px] sm:h-[440px]"
                >
                    <div
                        class="absolute left-1/2 -translate-x-[calc(50%+170px)] top-6 z-0 hidden sm:block pointer-events-none -rotate-[6deg]"
                    >
                        <div
                            class="w-56 h-[22rem] rounded-[2rem] border-[6px] border-zinc-800 bg-zinc-950 shadow-2xl flex flex-col p-3 overflow-hidden relative"
                        >
                            <div
                                class="absolute top-0 inset-x-0 h-4 flex justify-center"
                            >
                                <div
                                    class="w-20 h-full rounded-b-[0.75rem] bg-zinc-900"
                                ></div>
                            </div>
                            <div
                                class="w-full flex items-center gap-3 mt-6 mb-4 px-1"
                            >
                                <div
                                    class="w-8 h-8 rounded-full bg-violet-500/25 flex items-center justify-center shrink-0"
                                >
                                    <div
                                        class="w-4 h-4 rounded-full bg-violet-500"
                                    ></div>
                                </div>
                                <div class="flex-1 flex flex-col gap-1.5">
                                    <span
                                        class="text-[11px] font-semibold text-zinc-300 leading-none"
                                        >App 2</span
                                    >
                                    <div
                                        class="h-2 w-20 rounded-full bg-zinc-800"
                                    ></div>
                                </div>
                            </div>
                            <div
                                class="flex-1 rounded-xl p-3 flex flex-col gap-3 bg-zinc-900"
                            >
                                <div
                                    class="w-full aspect-[2/1] rounded-lg bg-zinc-800"
                                ></div>
                                <div
                                    class="w-3/4 h-3 rounded-full bg-zinc-800"
                                ></div>
                                <div
                                    class="w-1/2 h-3 rounded-full bg-zinc-800"
                                ></div>
                                <div
                                    class="w-full h-3 rounded-full bg-zinc-800 mt-auto"
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div
                        class="absolute left-1/2 -translate-x-1/2 sm:-translate-x-[calc(50%+90px)] top-6 z-10"
                    >
                        <div
                            class={cn(
                                "w-48 sm:w-56 h-80 sm:h-[22rem] rounded-[2rem] border-[6px] shadow-2xl flex flex-col p-3 overflow-hidden transition-colors duration-700 relative",
                                isDark
                                    ? "bg-zinc-950 border-zinc-800"
                                    : "bg-zinc-50 border-zinc-200",
                            )}
                        >
                            <div
                                class="absolute top-0 inset-x-0 h-4 flex justify-center z-10"
                            >
                                <div
                                    class={cn(
                                        "w-20 h-full rounded-b-[0.75rem] transition-colors duration-700",
                                        isDark ? "bg-zinc-900" : "bg-zinc-200",
                                    )}
                                ></div>
                            </div>

                            <div
                                class="w-full flex items-center gap-3 mt-6 mb-4 px-1"
                            >
                                <div
                                    class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0"
                                >
                                    <div
                                        class="w-4 h-4 rounded-full bg-blue-500"
                                    ></div>
                                </div>
                                <div class="flex-1 flex flex-col gap-1.5">
                                    <span
                                        class={cn(
                                            "text-[11px] font-semibold leading-none transition-colors duration-700",
                                            isDark
                                                ? "text-zinc-200"
                                                : "text-zinc-700",
                                        )}
                                    >
                                        App 1
                                    </span>
                                    <div
                                        class={cn(
                                            "h-2 w-20 rounded-full transition-colors duration-700",
                                            isDark
                                                ? "bg-zinc-800"
                                                : "bg-zinc-200",
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
                                    <div
                                        class="w-full h-10 bg-destructive/20 rounded-lg"
                                    ></div>
                                </div>
                            {/if}

                            <div
                                class={cn(
                                    "flex-1 rounded-xl p-3 flex flex-col gap-3 transition-colors duration-700",
                                    isDark
                                        ? "bg-zinc-900 border-zinc-800"
                                        : "bg-white border-zinc-100 shadow-sm",
                                )}
                            >
                                <div
                                    class={cn(
                                        "w-full aspect-[2/1] rounded-lg transition-colors duration-700",
                                        isDark ? "bg-zinc-800" : "bg-zinc-100",
                                    )}
                                ></div>
                                <div
                                    class={cn(
                                        "w-3/4 h-3 flex-shrink-0 rounded-full transition-colors duration-700",
                                        isDark ? "bg-zinc-800" : "bg-zinc-100",
                                    )}
                                ></div>
                                <div
                                    class={cn(
                                        "w-1/2 h-3 flex-shrink-0 rounded-full transition-colors duration-700",
                                        isDark ? "bg-zinc-800" : "bg-zinc-100",
                                    )}
                                ></div>
                                <div
                                    class={cn(
                                        "w-full h-3 flex-shrink-0 rounded-full transition-colors duration-700 mt-auto",
                                        isDark ? "bg-zinc-800" : "bg-zinc-100",
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
                                        <div
                                            class="h-2 w-3/4 rounded-full bg-primary-foreground/40"
                                        ></div>
                                        <div
                                            class="h-1.5 w-1/2 rounded-full bg-primary-foreground/25 mt-1"
                                        ></div>
                                    </div>
                                    <div class="flex items-center gap-0.5">
                                        <span
                                            class="w-0.5 h-2 bg-primary-foreground/60 rounded-full animate-pulse"
                                        ></span>
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
                            <div
                                class="flex items-center justify-between border-b border-border pb-3"
                            >
                                <div class="flex items-center gap-2">
                                    <div
                                        class="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center"
                                    >
                                        <Smartphone
                                            class="text-primary"
                                            size={14}
                                        />
                                    </div>
                                    <h3 class="text-sm font-semibold">
                                        Apply Patches
                                    </h3>
                                </div>
                                <div class="flex items-center gap-1">
                                    <span
                                        class="w-1.5 h-1.5 rounded-full bg-blue-500"
                                    ></span>
                                    <span
                                        class="w-1.5 h-1.5 rounded-full bg-violet-500"
                                    ></span>
                                    <span
                                        class="w-1.5 h-1.5 rounded-full bg-amber-500"
                                    ></span>
                                </div>
                            </div>
                            <div class="space-y-3 pt-1">
                                {#each patches as p, i (p.name)}
                                    {@const active = step >= p.activeAt}
                                    <div
                                        class="flex items-center justify-between gap-4"
                                    >
                                        <span
                                            class="text-sm font-medium text-foreground"
                                            >{p.name}</span
                                        >
                                        <div
                                            class={cn(
                                                "w-10 h-6 flex items-center rounded-full p-1 transition-colors duration-300 shrink-0 border relative",
                                                active
                                                    ? "bg-primary border-primary"
                                                    : "bg-muted border-border",
                                            )}
                                        >
                                            <div
                                                style:transform="translateX({toggles[
                                                    i
                                                ].current}px)"
                                                class={cn(
                                                    "w-4 h-4 rounded-full shadow-sm relative z-10",
                                                    active
                                                        ? "bg-primary-foreground"
                                                        : "bg-muted-foreground",
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
        </div>
    </div>
</div>

<section class="border-t border-border bg-muted/20">
    <div class="max-w-6xl mx-auto px-6 py-20 lg:py-28">
        <div class="text-center max-w-2xl mx-auto mb-16">
            <h2 class="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                How it works
            </h2>
            <p class="text-lg text-muted-foreground leading-relaxed">
                The patch engine runs on your phone. Nothing about your apps
                leaves the device.
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
                <span
                    class="text-xs font-semibold text-primary tracking-[0.2em] uppercase mb-3"
                    >Step 01</span
                >
                <h3 class="text-xl font-semibold mb-3">
                    Install the Reseam Manager
                </h3>
                <p class="text-muted-foreground leading-relaxed">
                    Reseam Manager is an Android app. Install it once and the
                    patch engine lives on your phone.
                </p>
            </div>

            <div class="flex flex-col items-center text-center">
                <div class="h-40 mb-8 flex items-center justify-center">
                    <div
                        class="bg-card border border-border rounded-2xl p-4 shadow-xl w-48 flex flex-col gap-3"
                    >
                        {#each sampleToggles as [name, on] (name)}
                            <div
                                class="flex items-center justify-between gap-3"
                            >
                                <span
                                    class="text-xs font-medium text-foreground"
                                    >{name}</span
                                >
                                <div
                                    class={cn(
                                        "w-8 h-5 rounded-full p-0.5 flex items-center transition-colors",
                                        on
                                            ? "bg-primary justify-end"
                                            : "bg-muted justify-start border border-border",
                                    )}
                                >
                                    <div
                                        class={cn(
                                            "w-3.5 h-3.5 rounded-full",
                                            on
                                                ? "bg-primary-foreground"
                                                : "bg-muted-foreground",
                                        )}
                                    ></div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
                <span
                    class="text-xs font-semibold text-primary tracking-[0.2em] uppercase mb-3"
                    >Step 02</span
                >
                <h3 class="text-xl font-semibold mb-3">Pick your patches</h3>
                <p class="text-muted-foreground leading-relaxed">
                    Browse community-built patches for the apps you already use.
                    Toggle the ones you want.
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
                                <div
                                    class="w-2.5 h-2.5 rounded-full bg-blue-500"
                                ></div>
                            </div>
                            <div
                                class="w-full h-1.5 rounded-full bg-zinc-800"
                            ></div>
                            <div
                                class="w-3/4 h-1.5 rounded-full bg-zinc-800"
                            ></div>
                            <div
                                class="w-2/3 h-1.5 rounded-full bg-zinc-800 mt-auto"
                            ></div>
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
                <span
                    class="text-xs font-semibold text-primary tracking-[0.2em] uppercase mb-3"
                    >Step 03</span
                >
                <h3 class="text-xl font-semibold mb-3">
                    Install the patched APK
                </h3>
                <p class="text-muted-foreground leading-relaxed">
                    Reseam builds and signs the APK on-device. The new app
                    installs alongside the original.
                </p>
            </div>
        </div>
    </div>
</section>
