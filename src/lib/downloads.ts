export type AndroidAbi = 'arm64-v8a' | 'armeabi-v7a' | 'x86_64' | 'x86';

export type Platform = { os: 'android'; abi: AndroidAbi } | { os: 'linux' } | { os: 'other' };

export type ManagerDownload = { name: string; detail: string; url: string };

const abiDetails: Record<AndroidAbi, string> = {
	'arm64-v8a': '64-bit ARM, most phones',
	'armeabi-v7a': '32-bit ARM, older phones',
	x86_64: '64-bit x86, emulators and Chromebooks',
	x86: '32-bit x86',
};

/** File names as Manager's release workflow uploads them, served through the API's redirect to the release. */
export function managerDownloads(apiUrl: string, version: string) {
	const file = (name: string) => `${apiUrl}/manager/v${version}/${name}`;
	const android = Object.fromEntries(
		Object.entries(abiDetails).map(([abi, detail]) => [
			abi,
			{ name: 'Android', detail, url: file(`composeApp-${abi}-release.apk`) },
		])
	) as Record<AndroidAbi, ManagerDownload>;
	const linux: ManagerDownload[] = [
		{
			name: 'Debian, Ubuntu',
			detail: '.deb',
			url: file(`app.reseam.manager_${version}_amd64.deb`),
		},
		{
			name: 'Fedora, openSUSE',
			detail: '.rpm',
			url: file(`app.reseam.manager-${version}-1.x86_64.rpm`),
		},
		{
			name: 'Arch Linux',
			detail: '.pkg.tar.zst',
			url: file(`app.reseam.manager-${version}-1-x86_64.pkg.tar.zst`),
		},
	];
	return { android, linux };
}

type UserAgentData = {
	getHighEntropyValues(hints: string[]): Promise<{ architecture?: string; bitness?: string }>;
};

export async function detectPlatform(): Promise<Platform> {
	const ua = navigator.userAgent;
	if (/Android/i.test(ua)) return { os: 'android', abi: await androidAbi(ua) };
	if (/Linux/.test(ua) && !/CrOS/.test(ua)) return { os: 'linux' };
	return { os: 'other' };
}

/** Browsers that expose client hints report the CPU; the rest are almost always 64-bit ARM phones. */
async function androidAbi(ua: string): Promise<AndroidAbi> {
	const userAgentData = (navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData;
	const { architecture = '', bitness = '' } =
		(await userAgentData?.getHighEntropyValues(['architecture', 'bitness'])) ?? {};
	if (architecture === 'x86' || /x86|i686/.test(ua))
		return bitness === '32' || /i686/.test(ua) ? 'x86' : 'x86_64';
	if (bitness === '32' || /armv7|armv8l/.test(ua)) return 'armeabi-v7a';
	return 'arm64-v8a';
}
