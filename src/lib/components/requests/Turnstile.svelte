<script lang="ts" module>
	type Turnstile = {
		render(
			container: HTMLElement,
			options: {
				sitekey: string;
				theme: 'dark';
				callback(token: string): void;
				'error-callback'(): void;
			}
		): string;
		remove(widget: string): void;
	};

	let loading: Promise<Turnstile> | undefined;

	function loadTurnstile() {
		return (loading ??= new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
			script.async = true;
			script.onload = () => resolve((window as unknown as { turnstile: Turnstile }).turnstile);
			script.onerror = () => reject(new Error('Turnstile did not load'));
			document.head.append(script);
		}));
	}
</script>

<script lang="ts">
	import { TURNSTILE_SITE_KEY } from '$app/env/public';

	let { onverified, onfailed }: { onverified: (token: string) => void; onfailed: () => void } =
		$props();

	let container: HTMLDivElement;

	$effect(() => {
		let widget: string | undefined;
		let turnstile: Turnstile | undefined;
		loadTurnstile().then((loaded) => {
			turnstile = loaded;
			widget = loaded.render(container, {
				sitekey: TURNSTILE_SITE_KEY,
				theme: 'dark',
				callback: onverified,
				'error-callback': onfailed,
			});
		}, onfailed);
		return () => widget && turnstile?.remove(widget);
	});
</script>

<div bind:this={container} class="min-h-16.5"></div>
