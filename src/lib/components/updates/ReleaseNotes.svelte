<script lang="ts">
	import type { ReleaseNotes } from '#lib/notes.ts';

	let { notes }: { notes: ReleaseNotes } = $props();
</script>

{#if notes.sections.length === 0 && !notes.prose}
	<p class="text-body-large text-on-surface-variant">
		Maintenance release with no changes to note{notes.engine
			? `. Runs on engine ${notes.engine}`
			: ''}.
	</p>
{:else}
	<div class="grid max-w-[72ch] gap-6 text-article">
		{#if notes.prose}<p class="whitespace-pre-wrap text-on-surface">{notes.prose}</p>{/if}
		{#each notes.sections as section (section.kind)}
			<section class="grid gap-2">
				<h3 class="text-title-medium">{section.title}</h3>
				<ul class="grid list-disc gap-1.5 pl-5 text-on-surface-variant marker:text-outline">
					{#each section.changes as change, i (i)}
						<li>
							{#if change.app}<span class="font-semibold text-on-surface">{change.app}:</span>{/if}
							{change.text}
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
{/if}
