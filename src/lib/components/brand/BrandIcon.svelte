<script lang="ts">
	let { path, size = 24 }: { path: string; size?: number } = $props();
</script>

<svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
	<path d={path} />
</svg>
