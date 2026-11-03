export function save(file: Blob, name: string) {
	const url = URL.createObjectURL(file);
	const link = Object.assign(document.createElement('a'), { href: url, download: name });
	link.click();
	setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
