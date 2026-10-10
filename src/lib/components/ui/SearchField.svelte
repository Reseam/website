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
			'pointer-events-none absolute top-1/2 -translate-y-1/2 text-on-surface-variant',
			size === 'lg' ? 'left-5.5' : 'left-3.5',
		]}
	/>
	<input
		type="search"
		bind:value
		placeholder={label}
		class={[
			'w-full border text-on-surface transition-colors placeholder:text-on-surface-variant focus:border-primary focus:outline-none',
			size === 'lg'
				? 'h-15 rounded-full border-transparent bg-surface-container-low pr-6 pl-14 text-body-large hover:bg-surface-container focus:bg-surface-container-low'
				: 'h-10 rounded-md border-outline-variant bg-surface pr-3 pl-10 text-body-medium',
		]}
	/>
</label>
