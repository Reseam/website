export type ButtonVariant = 'primary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm';

const variants: Record<ButtonVariant, string> = {
	primary: 'bg-primary text-on-primary hover:brightness-105',
	outline: 'border border-outline-variant text-on-surface hover:bg-surface-container',
	ghost: 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
};

const sizes: Record<ButtonSize, string> = {
	sm: 'h-9 gap-1.5 rounded-sm px-3 text-label-large',
	md: 'h-10 gap-2 rounded-md px-4 text-label-large',
	lg: 'h-12 gap-2 rounded-lg px-6 text-title-medium',
	icon: 'size-10 rounded-full',
	'icon-sm': 'size-8 rounded-full',
};

/** Shared by Button and by Bits UI triggers that render their own element. */
export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md') {
	return [
		'inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-[background-color,color,filter,scale] duration-150 select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
		variants[variant],
		sizes[size],
	].join(' ');
}
