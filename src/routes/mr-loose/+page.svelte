<script lang="ts">
	import EasterEgg from '$lib/components/EasterEgg.svelte';
	import loose from '$lib/assets/easter-eggs/mr-loose.webp';
</script>

<EasterEgg
	title="Mr. Loose"
	tagline="Can sense not being tight."
	screenshots={[
		{
			src: loose,
			alt: 'Anajrim: No… I can sense not being tight',
			width: 870,
			height: 183,
		},
	]}
	next={{ href: '/mr-tight/', label: 'Meet Mr. Tight' }}
/>
