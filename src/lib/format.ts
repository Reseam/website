import { getLocale } from '#lib/paraglide/runtime.js';

const dateFormat = (options: Intl.DateTimeFormatOptions) =>
	new Intl.DateTimeFormat(getLocale(), options);

const unit = (value: number, unit: string, maximumFractionDigits = 0) =>
	new Intl.NumberFormat(getLocale(), {
		style: 'unit',
		unit,
		unitDisplay: 'narrow',
		maximumFractionDigits,
	}).format(value);

export function shortDate(iso: string) {
	const date = new Date(iso);
	return dateFormat(
		date.getFullYear() === new Date().getFullYear()
			? { month: 'short', day: 'numeric' }
			: { month: 'short', day: 'numeric', year: 'numeric' }
	).format(date);
}

export function longDate(iso: string) {
	return dateFormat({ month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(iso));
}

/** "Today", "Yesterday" or "3 days ago" within a month, the date after that. */
export function recentDate(iso: string) {
	const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
	if (days >= 30) return shortDate(iso);
	const text = new Intl.RelativeTimeFormat(getLocale(), { numeric: 'auto' }).format(-days, 'day');
	return text[0].toLocaleUpperCase(getLocale()) + text.slice(1);
}

export function duration(milliseconds: number) {
	const seconds = milliseconds / 1000;
	if (seconds < 10) return unit(seconds, 'second', 1);
	if (seconds < 60) return unit(Math.round(seconds), 'second');
	const whole = Math.round(seconds);
	return `${unit(Math.floor(whole / 60), 'minute')} ${unit(whole % 60, 'second')}`;
}

export function megabytes(bytes: number) {
	return unit(bytes / 1024 / 1024, 'megabyte', 1);
}
