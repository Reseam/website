<script lang="ts">
	import ChevronUp from '@lucide/svelte/icons/chevron-up';

	let {
		votes,
		voted,
		disabled = false,
		onclick,
	}: { votes: number; voted: boolean; disabled?: boolean; onclick: () => void } = $props();
</script>

<button
	type="button"
	{onclick}
	{disabled}
	aria-pressed={voted}
	aria-label="{voted ? 'Remove your vote' : 'Vote'}, {votes} {votes === 1 ? 'vote' : 'votes'}"
	class={[
		'grid h-14 w-12 shrink-0 place-items-center content-center rounded-md border text-label-large tabular-nums transition-colors duration-150 disabled:opacity-50',
		voted
			? 'border-primary bg-secondary-container text-primary'
			: 'border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface',
	]}
>
	<ChevronUp size={16} />
	{votes}
</button>
