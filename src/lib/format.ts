import { formatDistanceToNow, format } from 'date-fns';

export function relTime(iso: string): string {
	try {
		return formatDistanceToNow(new Date(iso), { addSuffix: true });
	} catch {
		return '';
	}
}

export function fullTime(iso: string): string {
	try {
		return format(new Date(iso), 'PPP');
	} catch {
		return '';
	}
}
