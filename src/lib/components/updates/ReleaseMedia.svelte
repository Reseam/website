<script lang="ts">
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import type { Media } from '#lib/notes.ts';

	// Media is embedded only for releases Reseam publishes. Elsewhere it stays a link, like every image in
	// text that comes from the public.
	let { media, embed = false }: { media: Media[]; embed?: boolean } = $props();

	// Media holds a wide frame until its own shape is known; a tall one then stands at a capped height
	// instead of filling the column.
	const shapes = new SvelteMap<string, 'wide' | 'tall'>();
	const failed = new SvelteSet<string>();

	const shape = (width: number, height: number) => (height > width ? 'tall' : 'wide');
	const frame = (url: string) =>
		shapes.get(url) === 'tall' ? 'h-auto max-h-120 w-auto max-w-full' : 'w-full';

	// Listens from an attachment, not from attributes: an image can finish or fail before hydration.
	const watched = (url: string) => (image: HTMLImageElement) => {
		const settle = () => {
			if (image.naturalWidth > 0) shapes.set(url, shape(image.naturalWidth, image.naturalHeight));
			else failed.add(url);
		};
		if (image.complete) settle();
		image.addEventListener('load', settle);
		image.addEventListener('error', settle);
		return () => {
			image.removeEventListener('load', settle);
			image.removeEventListener('error', settle);
		};
	};
</script>

<div class="grid justify-items-start gap-3">
	{#each media as item (item.url)}
		{#if !embed || failed.has(item.url)}
			<a href={item.url} target="_blank" rel="noopener" class="text-primary hover:underline"
				>{item.name || item.url}</a
			>
		{:else if item.video}
			<!-- svelte-ignore a11y_media_has_caption (a release attaches the file alone, with no captions to offer) -->
			<video
				src={item.url}
				controls
				playsinline
				preload="metadata"
				aria-label={item.name}
				class={[
					'rounded-lg bg-surface-container',
					frame(item.url),
					!shapes.has(item.url) && 'aspect-video',
				]}
				onloadedmetadata={({ currentTarget: video }) =>
					shapes.set(item.url, shape(video.videoWidth, video.videoHeight))}
				onerror={() => failed.add(item.url)}
			></video>
		{:else}
			<a
				href={item.url}
				target="_blank"
				rel="noopener"
				class={['overflow-hidden rounded-lg', shapes.get(item.url) !== 'tall' && 'w-full']}
			>
				<img
					src={item.url}
					alt={item.name}
					decoding="async"
					class={[frame(item.url), !shapes.has(item.url) && 'aspect-video bg-surface-container']}
					{@attach watched(item.url)}
				/>
			</a>
		{/if}
	{/each}
</div>
