<script lang="ts">
	import EasterEgg from '$lib/components/EasterEgg.svelte';
	import asks from '$lib/assets/easter-eggs/mr-tight-asks.webp';
	import confirmed from '$lib/assets/easter-eggs/mr-tight-confirmed.webp';
</script>

<EasterEgg
	title="Mr. Tight"
	tagline="Tight, it seems."
	screenshots={[
		{
			src: asks,
			alt: "FreakGPT 6.7 XHigh, replying to Anajrim's “I have my suspicions that everything in the autocorrect is wrong”: wait. what are you assuming with that statement. that I'm not tight?",
			width: 1431,
			height: 461,
		},
		{
			src: confirmed,
			alt: "FreakGPT 6.7 XHigh: and I'm tight it seems. Followed by a cat sticker.",
			width: 1400,
			height: 546,
		},
	]}
	next={{ href: '/mr-loose/', label: 'Meet Mr. Loose' }}
/>
