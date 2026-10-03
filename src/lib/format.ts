const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const day = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });
const dayYear = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' });
const long = new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' });

export function shortDate(iso: string) {
	const date = new Date(iso);
	return (date.getFullYear() === new Date().getFullYear() ? day : dayYear).format(date);
}

export function longDate(iso: string) {
	return long.format(new Date(iso));
}

/** "Today", "Yesterday" or "3 days ago" within a month, the date after that. */
export function recentDate(iso: string) {
	const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
	if (days < 30) return capitalize(relative.format(-days, 'day'));
	return shortDate(iso);
}

export function duration(milliseconds: number) {
	const seconds = milliseconds / 1000;
	if (seconds < 10) return `${seconds.toFixed(1)}s`;
	if (seconds < 60) return `${Math.round(seconds)}s`;
	const whole = Math.round(seconds);
	return `${Math.floor(whole / 60)}m ${String(whole % 60).padStart(2, '0')}s`;
}

export function megabytes(bytes: number) {
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function plural(count: number, one: string, many = `${one}s`) {
	return `${count} ${count === 1 ? one : many}`;
}

const capitalize = (text: string) => text[0].toUpperCase() + text.slice(1);
