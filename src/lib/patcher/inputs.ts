export type AppInput = { app: File; splits: File[] };

const extension = (file: File) => file.name.split('.').at(-1)?.toLowerCase() ?? '';

export function sortFiles(files: File[]): {
	input: AppInput | null;
	bundles: File[];
	error?: string;
} {
	const bundles = files.filter((file) => extension(file) === 'reseam');
	const containers = files.filter((file) => ['apkm', 'xapk'].includes(extension(file)));
	const apks = files.filter((file) => extension(file) === 'apk');
	const others = files.length - bundles.length - containers.length - apks.length;
	if (others > 0)
		return { input: null, bundles, error: 'Choose APK, APKM, XAPK or .reseam files.' };
	if (containers.length > 1 || (containers.length === 1 && apks.length > 0)) {
		return { input: null, bundles, error: 'Choose one app at a time.' };
	}
	if (containers.length === 1) return { input: { app: containers[0], splits: [] }, bundles };
	if (apks.length === 0) return { input: null, bundles };
	// Split sets name their base APK base.apk; otherwise the base carries the code and is largest.
	const app =
		apks.find((file) => file.name.toLowerCase() === 'base.apk') ??
		apks.reduce((largest, file) => (file.size > largest.size ? file : largest));
	return { input: { app, splits: apks.filter((file) => file !== app) }, bundles };
}
