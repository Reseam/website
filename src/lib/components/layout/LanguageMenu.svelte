<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Languages from '@lucide/svelte/icons/languages';
	import { DropdownMenu } from 'bits-ui';
	import Tooltip from '#lib/components/ui/Tooltip.svelte';
	import { buttonClass } from '#lib/components/ui/button.ts';
	import { chooseLanguage } from '#lib/language.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, isLocale, locales } from '#lib/paraglide/runtime.js';

	/** A language is named in itself, so it reads the same whatever the site's language is. */
	function languageName(locale: string) {
		const name = new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale;
		return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
	}
</script>

<DropdownMenu.Root>
	<Tooltip text={m.nav_language()}>
		{#snippet trigger({ props })}
			<DropdownMenu.Trigger
				{...props}
				class={buttonClass('ghost', 'icon')}
				aria-label={m.nav_language()}
			>
				<Languages size={18} />
			</DropdownMenu.Trigger>
		{/snippet}
	</Tooltip>
	<DropdownMenu.Portal>
		<DropdownMenu.Content align="end" sideOffset={6} class="menu min-w-48 p-1">
			<DropdownMenu.RadioGroup
				value={getLocale()}
				onValueChange={(locale) => isLocale(locale) && chooseLanguage(locale)}
			>
				{#each locales as locale (locale)}
					<DropdownMenu.RadioItem value={locale} lang={locale} class="menu-item">
						{#snippet children({ checked })}
							{languageName(locale)}
							{#if checked}<Check size={15} class="text-primary" />{/if}
						{/snippet}
					</DropdownMenu.RadioItem>
				{/each}
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
