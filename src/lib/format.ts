import { formatDistanceToNow, format } from 'date-fns';

export function relTime(iso: string) {
	return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function fullTime(iso: string) {
	return format(new Date(iso), 'PPP');
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
