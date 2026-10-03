export type ManagerBuild = {
	id: string;
	platform: 'Android' | 'Windows' | 'Linux';
	detail: string;
	url: string;
};

/** File names as Reseam Manager's release workflow uploads them, served through the API's redirect. */
export function managerBuilds(apiUrl: string, version: string): ManagerBuild[] {
	const file = (name: string) => `${apiUrl}/manager/v${version}/${name}`;
	const android = (abi: string, detail: string): ManagerBuild => ({
		id: `android-${abi}`,
		platform: 'Android',
		detail,
		url: file(`composeApp-${abi}-release.apk`),
	});
	return [
		android('arm64-v8a', '64-bit ARM, most phones'),
		android('armeabi-v7a', '32-bit ARM, older phones'),
		android('x86_64', '64-bit x86, emulators and Chromebooks'),
		android('x86', '32-bit x86'),
		{
			id: 'windows',
			platform: 'Windows',
			detail: '64-bit installer',
			url: file(`reseam-manager-${version}-windows-x64.exe`),
		},
		{
			id: 'linux-deb',
			platform: 'Linux',
			detail: 'Debian and Ubuntu',
			url: file(`app.reseam.manager_${version}_amd64.deb`),
		},
		{
			id: 'linux-rpm',
			platform: 'Linux',
			detail: 'Fedora and openSUSE',
			url: file(`app.reseam.manager-${version}-1.x86_64.rpm`),
		},
		{
			id: 'linux-arch',
			platform: 'Linux',
			detail: 'Arch',
			url: file(`app.reseam.manager-${version}-1-x86_64.pkg.tar.zst`),
		},
	];
}

type UserAgentData = {
	getHighEntropyValues(hints: string[]): Promise<{ architecture?: string; bitness?: string }>;
};

/** The build that fits this device; phones without client hints are almost always 64-bit ARM. */
export async function preferredBuild(): Promise<string> {
	const ua = navigator.userAgent;
	if (/Windows NT/i.test(ua)) return 'windows';
	if (/Linux/.test(ua) && !/Android|CrOS/i.test(ua)) return 'linux-deb';
	if (!/Android/i.test(ua)) return 'android-arm64-v8a';
	const hints = (navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData;
	const { architecture = '', bitness = '' } =
		(await hints?.getHighEntropyValues(['architecture', 'bitness'])) ?? {};
	if (architecture === 'x86' || /x86|i686/.test(ua))
		return bitness === '32' || /i686/.test(ua) ? 'android-x86' : 'android-x86_64';
	if (bitness === '32' || /armv7|armv8l/.test(ua)) return 'android-armeabi-v7a';
	return 'android-arm64-v8a';
}
