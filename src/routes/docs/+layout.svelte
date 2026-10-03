<script lang="ts">
	import Sidebar from '#lib/components/docs/Sidebar.svelte';

	let { data, children } = $props();
</script>

<div
	class="container-page grid grid-cols-1 items-start gap-6 pt-6 pb-20 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-16 lg:pt-8"
>
	<aside><Sidebar groups={data.groups} /></aside>
	<div class="min-w-0">{@render children()}</div>
</div>
