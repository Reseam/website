<script lang="ts">
	import Package from '@lucide/svelte/icons/package';

	let { icon, size }: { icon?: string; size: number } = $props();

	let failed = $state<string>();
</script>

{#if icon && icon !== failed}
	<img
		src={icon}
		alt=""
		width={size}
		height={size}
		loading="lazy"
		referrerpolicy="no-referrer"
		onerror={() => (failed = icon)}
		class="shrink-0 rounded-full"
	/>
{:else}
	<span
		aria-hidden="true"
		style:width="{size}px"
		style:height="{size}px"
		class="grid shrink-0 place-items-center rounded-full bg-surface-container-highest text-on-surface-variant"
	>
		<Package size={size / 2} />
	</span>
{/if}
