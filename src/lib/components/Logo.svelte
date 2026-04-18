<script lang="ts">
	let { size = 32, class: className = '' }: { size?: number; class?: string } = $props();
</script>

<img
	src="/logo.svg"
	alt="Reseam"
	width={size}
	height={size}
	class={className}
	draggable="false"
/>
