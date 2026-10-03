<script lang="ts">
	import Download from '@lucide/svelte/icons/download';

	let { title, detail, href }: { title: string; detail: string; href: string } = $props();
</script>

<li>
	<a
		{href}
		class="group flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted sm:px-5"
	>
		<span class="grid min-w-0 flex-1">
			<span class="text-sm font-medium">{title}</span>
			<span class="text-xs text-muted-foreground">{detail}</span>
		</span>
		<Download
			size={16}
			class="text-muted-foreground transition-[color,translate] duration-200 group-hover:translate-y-0.5 group-hover:text-foreground"
		/>
	</a>
</li>
