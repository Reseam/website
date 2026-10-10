<script lang="ts">
	// `lead` is the intro text on the docs hub; pages use the longer prose line height.
	let { html, variant = 'prose' }: { html: string; variant?: 'prose' | 'lead' } = $props();
</script>

<div class={['prose', variant === 'lead' && 'lead']}>
	{@html html}
</div>

<style>
	.prose {
		max-width: 80ch;
		font-size: var(--text-prose);
		line-height: var(--text-prose--line-height);
		color: color-mix(in oklch, var(--color-on-surface) 88%, var(--color-on-surface-variant));
	}
	.prose.lead {
		font-size: var(--text-body-large);
		line-height: var(--text-body-large--line-height);
	}
	.prose :global(:where(p, ul, ol, table, pre, blockquote, .markdown-alert)) {
		margin-block: 0 1.1em;
	}
	.prose :global(:where(h2, h3, h4)) {
		color: var(--color-on-surface);
		scroll-margin-top: 1.5rem;
	}
	.prose :global(h2) {
		margin-block: 2.2em 0.6em;
		font-size: var(--text-headline-small);
		line-height: var(--text-headline-small--line-height);
		font-weight: var(--text-headline-small--font-weight);
		letter-spacing: var(--text-headline-small--letter-spacing);
	}
	.prose :global(:where(h3, h4)) {
		font-size: var(--text-title-medium);
		line-height: var(--text-title-medium--line-height);
		font-weight: var(--text-title-medium--font-weight);
		letter-spacing: var(--text-title-medium--letter-spacing);
	}
	.prose :global(h3) {
		margin-block: 1.8em 0.5em;
	}
	.prose :global(h4) {
		margin-block: 1.5em 0.4em;
	}
	.prose :global(:where(ul, ol)) {
		padding-left: 1.4em;
	}
	.prose :global(ul) {
		list-style: disc;
	}
	.prose :global(ol) {
		list-style: decimal;
	}
	.prose :global(li + li) {
		margin-top: 0.3em;
	}
	.prose :global(li::marker) {
		color: var(--color-on-surface-variant);
	}
	.prose :global(a) {
		color: var(--color-primary);
		text-decoration: underline;
		text-decoration-color: color-mix(in oklch, var(--color-primary) 40%, transparent);
		text-underline-offset: 3px;
		transition: text-decoration-color 150ms;
	}
	.prose :global(a:hover) {
		text-decoration-color: var(--color-primary);
	}
	.prose :global(strong) {
		color: var(--color-on-surface);
		font-weight: 600;
	}
	.prose :global(:not(pre) > code) {
		padding: 0.1em 0.4em;
		border: 1px solid var(--color-outline-variant);
		border-radius: 0.375rem;
		background: var(--color-surface-container);
		color: var(--color-on-surface);
		font-family: var(--font-mono);
		font-size: 0.86em;
	}
	.prose :global(pre) {
		overflow-x: auto;
		padding: 1rem 1.15rem;
		border: 1px solid var(--color-outline-variant);
		border-radius: var(--radius-lg);
		background: var(--color-surface-container-low) !important;
		font-family: var(--font-mono);
		font-size: var(--text-code);
		line-height: var(--text-code--line-height);
	}
	.prose :global(table) {
		display: block;
		overflow-x: auto;
		border-collapse: collapse;
		font-size: var(--text-body-medium);
		line-height: var(--text-body-medium--line-height);
	}
	.prose :global(:where(th, td)) {
		padding: 0.5rem 0.9rem 0.5rem 0;
		border-bottom: 1px solid var(--color-outline-variant);
		text-align: left;
	}
	.prose :global(th) {
		color: var(--color-on-surface);
		font-weight: 600;
	}
	.prose :global(img) {
		max-width: 100%;
		border-radius: var(--radius-lg);
	}
	.prose :global(blockquote) {
		padding-left: 1rem;
		border-left: 2px solid var(--color-outline-variant);
		color: var(--color-on-surface-variant);
	}
	.prose :global(.markdown-alert) {
		padding: 0.8rem 1rem;
		border: 1px solid var(--color-outline-variant);
		border-left: 3px solid var(--color-primary);
		border-radius: var(--radius-md);
		background: var(--color-surface-container-low);
	}
	.prose :global(.markdown-alert-warning),
	.prose :global(.markdown-alert-caution) {
		border-left-color: var(--color-warning);
	}
	.prose :global(.markdown-alert-title) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.3rem;
		color: var(--color-on-surface);
		font-weight: 600;
	}
	.prose :global(.markdown-alert-title svg) {
		fill: currentColor;
	}
	.prose :global(.markdown-alert > :last-child) {
		margin-bottom: 0;
	}
</style>
