type Value = string | number | false | null | undefined | Record<string, unknown> | Value[];

export function cn(...inputs: Value[]): string {
	const out: string[] = [];
	const walk = (v: Value) => {
		if (!v) return;
		if (typeof v === 'string' || typeof v === 'number') {
			out.push(String(v));
			return;
		}
		if (Array.isArray(v)) {
			for (const item of v) walk(item as Value);
			return;
		}
		if (typeof v === 'object') {
			for (const [key, val] of Object.entries(v)) if (val) out.push(key);
		}
	};
	for (const i of inputs) walk(i);
	return out.join(' ');
}
