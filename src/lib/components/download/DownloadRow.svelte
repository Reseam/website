<script lang="ts">
	import Download from '@lucide/svelte/icons/download';

	let { title, detail, href }: { title: string; detail: string; href: string } = $props();
</script>

<li>
	<a
		{href}
		class="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-surface-container sm:px-5"
	>
		<span class="grid min-w-0 flex-1">
			<span class="text-label-large">{title}</span>
			<span class="text-body-small text-on-surface-variant">{detail}</span>
		</span>
		<Download
			size={16}
			class="text-on-surface-variant transition-[color,translate] duration-200 group-hover:translate-y-0.5 group-hover:text-on-surface"
		/>
	</a>
</li>
