import { formatDistanceToNow, format } from 'date-fns';

export function relTime(iso: string) {
	return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function fullTime(iso: string) {
	return format(new Date(iso), 'PPP');
}
