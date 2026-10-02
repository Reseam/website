<script lang="ts">
	import { Upload } from 'lucide-svelte';
	import Button from '$lib/components/Button.svelte';
	import { cn } from '$lib/cn';

	let { onfiles }: { onfiles: (files: File[]) => void } = $props();

	let input: HTMLInputElement;
	let dragging = $state(false);

	function drop(event: DragEvent) {
		event.preventDefault();
		dragging = false;
		const files = [...(event.dataTransfer?.files ?? [])];
		if (files.length > 0) onfiles(files);
	}

	function picked() {
		const files = [...(input.files ?? [])];
		input.value = '';
		if (files.length > 0) onfiles(files);
	}
</script>

<div
	role="region"
	aria-label="Choose an app"
	ondragover={(event) => {
		event.preventDefault();
		dragging = true;
	}}
	ondragleave={(event) => {
		if (!event.currentTarget.contains(event.relatedTarget as Node)) dragging = false;
	}}
	ondrop={drop}
	class={cn(
		'flex flex-col items-center rounded-[1.25rem] border border-dashed px-6 py-14 text-center transition-colors sm:py-20',
		dragging ? 'border-primary bg-primary/5' : 'border-border bg-card'
	)}
>
	<div class="mb-5 flex size-14 items-center justify-center rounded-full bg-muted">
		<Upload size={24} class={dragging ? 'text-primary' : 'text-muted-foreground'} />
	</div>
	<p class="text-lg font-semibold">Drop your app here</p>
	<p class="mt-1.5 max-w-sm text-sm text-muted-foreground">
		An APK, APKM or XAPK file. Split APKs and patch bundles can come along.
	</p>
	<Button class="mt-6" onclick={() => input.click()}>Choose file</Button>
	<input
		bind:this={input}
		type="file"
		multiple
		accept=".apk,.apkm,.xapk,.reseam"
		class="sr-only"
		tabindex="-1"
		aria-hidden="true"
		onchange={picked}
	/>
</div>
