<script lang="ts">
	import Upload from '@lucide/svelte/icons/upload';
	import { buttonClass } from '#lib/components/ui/button.ts';

	let { onfiles }: { onfiles: (files: File[]) => void } = $props();

	let dragging = $state(false);

	function take(files: FileList | null | undefined) {
		const list = [...(files ?? [])];
		if (list.length > 0) onfiles(list);
	}
</script>

<label
	ondragover={(event) => {
		event.preventDefault();
		dragging = true;
	}}
	ondragleave={(event) => {
		if (!event.currentTarget.contains(event.relatedTarget as Node)) dragging = false;
	}}
	ondrop={(event) => {
		event.preventDefault();
		dragging = false;
		take(event.dataTransfer?.files);
	}}
	class={[
		'grid cursor-pointer justify-items-center gap-2 rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors duration-200 has-focus-visible:border-primary sm:py-16',
		dragging
			? 'border-primary bg-primary/5'
			: 'border-outline-variant hover:border-primary/50 hover:bg-primary/[0.03]',
	]}
>
	<Upload
		size={34}
		strokeWidth={1.8}
		class={[
			'mb-2 text-primary transition-transform duration-300 ease-spring',
			dragging && '-translate-y-1 scale-110',
		]}
	/>
	<span class="text-title-medium">Drop an APK, APKM or XAPK</span>
	<span class="text-body-medium text-on-surface-variant"
		>Split APKs and patch bundles can come along.</span
	>
	<span class="mt-3 {buttonClass('outline', 'sm')}">Choose file</span>
	<input
		type="file"
		multiple
		accept=".apk,.apkm,.xapk,.reseam"
		class="sr-only"
		onchange={(event) => {
			take(event.currentTarget.files);
			event.currentTarget.value = '';
		}}
	/>
</label>
