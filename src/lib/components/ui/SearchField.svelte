<script lang="ts">
	import Search from '@lucide/svelte/icons/search';

	let {
		value = $bindable(''),
		label,
		size = 'md',
	}: { value?: string; label: string; size?: 'md' | 'lg' } = $props();
</script>

<label class="relative block">
	<span class="sr-only">{label}</span>
	<Search
		size={size === 'lg' ? 20 : 16}
		class={[
			'pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground',
			size === 'lg' ? 'left-5.5' : 'left-3.5',
		]}
	/>
	<input
		type="search"
		bind:value
		placeholder={label}
		class={[
			'w-full border text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none',
			size === 'lg'
				? 'h-15 rounded-full border-transparent bg-card pr-6 pl-14 text-base hover:bg-muted focus:bg-card'
				: 'h-10 rounded-md border-border bg-background pr-3 pl-10 text-sm',
		]}
	/>
</label>
