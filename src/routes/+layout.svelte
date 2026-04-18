<script lang="ts">
    import "../app.css";
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import { fade, scale } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import { Plus, Megaphone, Settings } from "lucide-svelte";
    import Button from "$lib/components/Button.svelte";
    import { cn } from "$lib/cn";
    import { settings } from "$lib/stores/settings.svelte";
    import { api } from "$lib/stores/api.svelte";

    let { children } = $props();

    let settingsOpen = $state(false);
    let localApiUrl = $state("");

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Download", path: "/download/" },
        { name: "Docs", path: "/docs/" },
    ];

    onMount(() => {
        settings.load();
    });

    $effect(() => {
        if (settingsOpen) localApiUrl = settings.apiUrl;
    });

    function saveSettings() {
        settings.setApiUrl(localApiUrl);
        api.reload();
        settingsOpen = false;
    }

    function isActive(path: string) {
        const current = page.url.pathname;
        if (path === "/") return current === "/";
        return current.startsWith(path);
    }
</script>

<div
    class="min-h-screen flex flex-col bg-background text-foreground transition-colors font-sans relative"
>
    <header
        class="sticky top-0 w-full z-40 bg-background/80 backdrop-blur-md border-b border-border"
    >
        <div
            class="container mx-auto px-6 h-20 flex items-center justify-between"
        >
            <a href="/" class="flex items-center gap-2 group">
                <div
                    class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center relative overflow-hidden"
                >
                    <Plus class="text-primary z-10" size={16} />
                    <div
                        class="absolute inset-0 bg-primary/10 scale-0 group-hover:scale-100 transition-transform rounded-lg"
                    ></div>
                </div>
                <span class="font-semibold text-lg tracking-tight">Reseam</span>
            </a>

            <nav class="hidden md:flex items-center gap-8">
                {#each navLinks as link (link.path)}
                    <a
                        href={link.path}
                        class={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            isActive(link.path)
                                ? "text-foreground"
                                : "text-muted-foreground",
                        )}
                    >
                        {link.name}
                    </a>
                {/each}
            </nav>

            <div class="flex items-center gap-2">
                <a
                    href="/announcements/"
                    class="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Announcements"
                >
                    <Megaphone size={18} />
                </a>
                <button
                    onclick={() => (settingsOpen = true)}
                    class="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Settings"
                >
                    <Settings size={18} />
                </button>
            </div>
        </div>
    </header>

    <main class="flex-1 flex flex-col">
        {@render children()}
    </main>

    <footer class="py-8 border-border mt-auto">
        <div
            class="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6"
        >
            <div class="flex items-center gap-2 text-muted-foreground">
                <Plus size={16} />
                <span class="font-medium text-sm">Reseam</span>
                <span class="text-xs ml-2 opacity-60">
                    © {new Date().getFullYear()} Reseam Team
                </span>
            </div>
            <div class="flex gap-2">
                <a
                    href="https://git.reseam.app"
                    rel="noopener noreferrer"
                    class="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                    aria-label="Forgejo"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            d="M12 .297a12 12 0 0 0-3.79 23.39c.6.113.82-.258.82-.577v-2.234c-3.338.727-4.033-1.415-4.033-1.415-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.085 1.838 1.236 1.838 1.236 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.76-1.604-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.135-.303-.54-1.524.105-3.176 0 0 1.005-.322 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.552 3.297-1.23 3.297-1.23.645 1.652.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .32.21.694.825.577A12 12 0 0 0 12 .297z"
                        />
                    </svg>
                </a>
            </div>
        </div>
    </footer>

    {#if settingsOpen}
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
                transition:fade={{ duration: 200 }}
                class="absolute inset-0 bg-background/80 backdrop-blur-sm cursor-default"
                onclick={() => (settingsOpen = false)}
                aria-label="Close settings"
            ></button>
            <div
                in:scale={{ duration: 250, start: 0.95, easing: cubicOut }}
                out:scale={{ duration: 200, start: 0.95 }}
                class="relative bg-card border border-border p-6 sm:p-8 rounded-[1.5rem] shadow-lg w-full max-w-sm"
            >
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                    >
                        <Settings size={20} class="text-foreground" />
                    </div>
                    <h2 class="text-xl font-semibold">Settings</h2>
                </div>

                <div class="space-y-4">
                    <div>
                        <label
                            for="apiUrl"
                            class="block text-sm font-medium text-muted-foreground mb-1.5"
                        >
                            API Environment URL
                        </label>
                        <input
                            id="apiUrl"
                            type="text"
                            bind:value={localApiUrl}
                            placeholder={settings.defaultApiUrl}
                            class="w-full px-4 py-2.5 bg-background border border-border rounded-[0.75rem] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                    </div>

                    <div class="flex justify-end gap-3 pt-4">
                        <Button
                            variant="ghost"
                            onclick={() => (settingsOpen = false)}
                            >Cancel</Button
                        >
                        <Button onclick={saveSettings}
                            >Save configuration</Button
                        >
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>
