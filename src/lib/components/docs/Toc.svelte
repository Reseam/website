<script lang="ts">
	import type { DocHeading } from '#lib/docs/types.ts';

	let { headings }: { headings: DocHeading[] } = $props();

	let active = $state('');

	$effect(() => {
		const targets = headings
			.map(({ id }) => document.getElementById(id))
			.filter((element) => element !== null);
		const spy = () => {
			const passed = targets.filter((element) => element.getBoundingClientRect().top < 120);
			active = (passed.at(-1) ?? targets[0])?.id ?? '';
		};
		spy();
		addEventListener('scroll', spy, { passive: true });
		return () => removeEventListener('scroll', spy);
	});
</script>

<nav aria-labelledby="toc-title" class="sticky top-6 grid gap-2 text-body-medium">
	<p id="toc-title" class="mb-1 text-label-medium text-on-surface-variant">On this page</p>
	{#each headings as heading (heading.id)}
		<a
			href="#{heading.id}"
			aria-current={heading.id === active ? 'location' : undefined}
			class={[
				'border-l-2 border-transparent py-0.5 text-on-surface-variant transition-colors hover:text-on-surface aria-[current=location]:border-primary aria-[current=location]:text-on-surface',
				heading.level === 3 ? 'pl-6' : 'pl-3',
			]}
		>
			{heading.text}
		</a>
	{/each}
</nav>
