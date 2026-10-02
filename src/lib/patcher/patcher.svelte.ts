import {
	BrowserSession,
	EngineError,
	JavaRuntime,
	runtime,
	type Artifact,
	type Inspection,
	type MountedFile,
	type OptionValue,
	type PatchMetadata,
	type PatchResult,
	type PatchStatus,
	type Preset,
	type RunEvent,
} from '@reseam/browser';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { asset } from '$app/paths';
import { settings } from '$lib/settings.svelte';
import { duration } from '$lib/format';
import { fingerprint } from './files';
import { sortFiles, type AppInput } from './inputs';
import { fetchOfficialBundle, OFFICIAL_SIGNER, type OfficialBundle } from './official';
import { draftError, draftValue, initialDraft, type OptionDraft } from './options';
import { describe } from './problems';
import { closure, forPackage, preset, reference, runnable } from './selection';
import * as storage from './storage';

export const STAGES = [
	{ stage: 'starting', label: 'Starting up' },
	{ stage: 'reading', label: 'Reading the app' },
	{ stage: 'loading', label: 'Loading patches' },
	{ stage: 'applying', label: 'Applying patches' },
	{ stage: 'writing', label: 'Building and signing' },
] as const;

export type Stage = (typeof STAGES)[number]['stage'];

export type PatchRun = { reference: string; status: PatchStatus };

export type Report = {
	milliseconds: number;
	stages: { stage: Stage; milliseconds: number }[];
	patches: PatchRun[];
};

export type Phase =
	| { name: 'empty' }
	| { name: 'reading' }
	| { name: 'ready' }
	| {
			name: 'patching';
			stage: Stage;
			/** Milliseconds into the run at which each reached stage began. */
			marks: Partial<Record<Stage, number>>;
			finished: number;
			total: number;
			current: string | null;
	  }
	| { name: 'done'; apks: Artifact[]; results: PatchResult[]; report: Report; newKey: boolean }
	| {
			name: 'failed';
			message: string;
			failed: { reference: string; reason: string }[];
			report: Report;
	  };

export type Official =
	| { status: 'loading' }
	| { status: 'ready'; bundle: OfficialBundle }
	| { status: 'failed' };

export function capability(): string | null {
	if (!globalThis.crossOriginIsolated || typeof SharedArrayBuffer === 'undefined') {
		return 'This page could not enable the isolation patching needs. Reload it to try again.';
	}
	if (!navigator.storage?.getDirectory || !navigator.locks || !globalThis.WebAssembly) {
		return 'This browser cannot patch apps. Use a recent Chrome, Edge or Firefox.';
	}
	return null;
}

const draftKey = (patch: string, option: string) => `${patch}#${option}`;

export class Patcher {
	phase = $state<Phase>({ name: 'empty' });
	official = $state<Official>({ status: 'loading' });
	bundles = $state<File[]>([]);
	input = $state<AppInput | null>(null);
	inspection = $state<Inspection | null>(null);
	notice = $state<string | null>(null);
	ignoreVersions = $state(false);
	readonly chosen = new SvelteSet<string>();
	readonly drafts = new SvelteMap<string, OptionDraft>();
	readonly trusted = new SvelteSet<string>([OFFICIAL_SIGNER]);
	signingKey = $state<{ fingerprint: string } | null>(null);
	log = $state<string[]>([]);

	readonly patches = $derived(this.inspection ? forPackage(this.inspection) : []);
	readonly listed = $derived(this.patches.filter((patch) => !patch.hidden));
	readonly running = $derived(closure(this.chosen, this.patches));
	readonly untrusted = $derived(
		(this.inspection?.bundles ?? []).filter(
			(bundle) => !bundle.problem && !this.trusted.has(bundle.public_key)
		)
	);
	readonly blocker = $derived(this.findBlocker());

	// scripts/copy-runtime.ts serves the package's runtime files from the site root.
	private readonly java = new JavaRuntime({
		runtimeBase: new URL(asset(`/${runtime.base}`), location.href).href,
	});
	private session: BrowserSession | null = null;
	private controller = new AbortController();
	private files: MountedFile[] = [];
	private paths = { apk: '', splits: [] as string[], bundles: [] as string[] };
	private started = 0;
	private runs: PatchRun[] = [];

	async start() {
		// Java takes seconds to start cold; starting it with the page hides that.
		void this.java.warmup().catch((error) => this.write(String(error)));
		const [trusted, key] = await Promise.all([
			storage.load('trusted-signers'),
			storage.load('identity'),
		]);
		for (const signer of trusted ?? []) this.trusted.add(signer);
		await this.showKey(key);
		await this.loadOfficial();
	}

	async loadOfficial() {
		this.official = { status: 'loading' };
		try {
			this.official = { status: 'ready', bundle: await fetchOfficialBundle(settings.apiUrl) };
		} catch {
			this.official = { status: 'failed' };
		}
		if (this.input) await this.inspect();
	}

	async choose(files: File[]) {
		const sorted = sortFiles(files);
		this.notice = sorted.error ?? null;
		if (sorted.error) return;
		this.bundles = [...this.bundles, ...sorted.bundles];
		if (sorted.input) this.input = sorted.input;
		if (this.input) await this.inspect();
	}

	async removeBundle(file: File) {
		this.bundles = this.bundles.filter((bundle) => bundle !== file);
		if (this.input) await this.inspect();
	}

	async clearApp() {
		await this.closeSession();
		this.input = null;
		this.inspection = null;
		this.notice = null;
		this.phase = { name: 'empty' };
	}

	patchName = (key: string) =>
		this.inspection?.patches.find((patch) => reference(patch) === key)?.name ??
		key.split('/').at(-1)!;

	toggle(patch: PatchMetadata) {
		const key = reference(patch);
		if (this.chosen.has(key)) this.chosen.delete(key);
		else this.chosen.add(key);
	}

	choosePreset(value: Preset) {
		this.chosen.clear();
		for (const key of preset(this.listed, value, this.ignoreVersions)) this.chosen.add(key);
	}

	allowAnyVersion(value: boolean) {
		this.ignoreVersions = value;
		if (value) return;
		for (const patch of this.listed)
			if (!runnable(patch, false)) this.chosen.delete(reference(patch));
	}

	draft(patch: PatchMetadata, option: string): OptionDraft {
		return this.drafts.get(draftKey(reference(patch), option))!;
	}

	setDraft(patch: PatchMetadata, option: string, draft: OptionDraft) {
		this.drafts.set(draftKey(reference(patch), option), draft);
	}

	optionError(patch: PatchMetadata, option: string): string | null {
		const declaration = patch.options.find((candidate) => candidate.key === option)!;
		return draftError(declaration, this.draft(patch, option));
	}

	async trust(signer: string, value: boolean) {
		if (value) this.trusted.add(signer);
		else this.trusted.delete(signer);
		await storage.save(
			'trusted-signers',
			[...this.trusted].filter((key) => key !== OFFICIAL_SIGNER)
		);
	}

	async patch() {
		if (this.blocker || !this.inspection || !this.input) return;
		this.controller = new AbortController();
		this.log = [];
		this.runs = [];
		this.started = performance.now();
		this.phase = {
			name: 'patching',
			stage: 'starting',
			marks: { starting: 0 },
			finished: 0,
			total: this.listed.filter((patch) => this.running.has(reference(patch))).length,
			current: null,
		};
		try {
			const { options, uploads } = this.selectedOptions();
			const stored = await storage.load('identity');
			const credentials: MountedFile[] = stored
				? [
						{
							name: 'reseam.pk8',
							file: new File([stored.key], 'reseam.pk8'),
							directory: 'identity',
						},
						{
							name: 'reseam.der',
							file: new File([stored.cert], 'reseam.der'),
							directory: 'identity',
						},
					]
				: [];
			if (this.session && !this.session.completed)
				await this.session.mount([...uploads, ...credentials]);
			else await this.openSession([...uploads, ...credentials]);
			const outcome = await this.session!.patch({
				apk_path: this.paths.apk,
				split_paths: this.paths.splits,
				bundle_paths: this.paths.bundles,
				trust: { keys: [...this.trusted] },
				selection: {
					preset: 'none',
					enable: [...this.chosen],
					options,
					ignore_versions: this.ignoreVersions,
				},
				output: { kind: 'auto', path: '/output/patched' },
				signing: { key: '/identity/reseam.pk8', cert: '/identity/reseam.der' },
			});
			this.write(
				`Engine phases: ${outcome.metrics.phases.map((entry) => `${entry.phase} ${duration(entry.duration_ms)}`).join(', ')}`
			);
			const artifacts = await this.session!.artifacts();
			if (!stored) {
				const file = (name: string) => artifacts.find((artifact) => artifact.name === name)!.file;
				const key = {
					key: await file('identity/reseam.pk8').arrayBuffer(),
					cert: await file('identity/reseam.der').arrayBuffer(),
				};
				await storage.save('identity', key);
				await this.showKey(key);
			}
			this.phase = {
				name: 'done',
				apks: artifacts.filter((artifact) => !artifact.name.startsWith('identity/')),
				results: outcome.results,
				report: this.report(),
				newKey: !stored,
			};
		} catch (error) {
			if (this.controller.signal.aborted) {
				this.notice = 'Patching was cancelled.';
				this.phase = { name: 'ready' };
			} else {
				const reasons = new Map(
					this.runs.flatMap((run) =>
						run.status.kind === 'failed' ? [[run.reference, run.status.reason] as const] : []
					)
				);
				const failed =
					error instanceof EngineError && error.problem.type === 'patches_failed'
						? error.problem.patches.map((key) => ({
								reference: key,
								reason: reasons.get(key) ?? '',
							}))
						: [];
				this.write(describe(error, this.patchName));
				this.phase = {
					name: 'failed',
					message: describe(error, this.patchName),
					failed,
					report: this.report(),
				};
			}
			await this.closeSession();
		}
	}

	cancel() {
		this.controller.abort();
	}

	/** Drops failed patches, and the chosen patches that needed them, then patches again. */
	async retryWithout(references: string[]) {
		const dropped = references.flatMap((key) => [key, ...(this.running.get(key) ?? [])]);
		for (const key of dropped) this.chosen.delete(key);
		if (this.blocker) await this.edit();
		else await this.patch();
	}

	/** Releases the finished run's files. */
	async edit() {
		await this.closeSession();
		this.notice = null;
		this.phase = { name: 'ready' };
	}

	async importKey(key: storage.SigningKey) {
		await storage.save('identity', key);
		await this.showKey(key);
	}

	async exportKey(): Promise<storage.SigningKey | undefined> {
		return storage.load('identity');
	}

	async forgetKey() {
		await storage.remove('identity');
		this.signingKey = null;
	}

	dispose() {
		void this.session?.dispose();
		this.java.dispose();
	}

	private async showKey(key: storage.SigningKey | undefined) {
		this.signingKey = key ? { fingerprint: await fingerprint(key.cert) } : null;
	}

	private findBlocker(): string | null {
		if (!this.inspection) return 'Choose an app first.';
		if (this.inspection.bundles.some((bundle) => bundle.problem)) {
			return 'Remove the patch bundle that could not be read.';
		}
		if (this.untrusted.length > 0) return 'Trust or remove the other patch signers first.';
		if (this.chosen.size === 0) return 'Choose at least one patch.';
		const invalid = this.patches.filter(
			(patch) =>
				this.running.has(reference(patch)) &&
				patch.options.some((option) => this.optionError(patch, option.key))
		);
		if (invalid.length > 0) return `Fill in the options for ${invalid[0].name}.`;
		return null;
	}

	private selectedOptions() {
		const options: Record<string, Record<string, OptionValue>> = {};
		const uploads: MountedFile[] = [];
		let index = 0;
		for (const patch of this.patches) {
			const key = reference(patch);
			if (!this.running.has(key)) continue;
			for (const option of patch.options) {
				const resolved = draftValue(option, this.draft(patch, option.key), `options/${index++}`);
				if (!resolved) continue;
				(options[key] ??= {})[option.key] = resolved.value;
				uploads.push(...resolved.uploads);
			}
		}
		return { options, uploads };
	}

	private async inspect() {
		const input = this.input!;
		this.phase = { name: 'reading' };
		this.inspection = null;
		this.notice = null;
		await this.closeSession();
		// loadOfficial inspects again once the official bundle settles.
		if (this.official.status === 'loading') return;
		this.controller = new AbortController();
		const extension = input.app.name.split('.').at(-1)!.toLowerCase();
		const bundles = [
			...(this.official.status === 'ready' ? [this.official.bundle.file] : []),
			...this.bundles,
		];
		this.files = [
			{ name: `app.${extension}`, file: input.app },
			...input.splits.map((file, index) => ({ name: `split-${index}.apk`, file })),
			...bundles.map((file, index) => ({ name: `bundle-${index}.reseam`, file })),
		];
		this.paths = {
			apk: `/input/app.${extension}`,
			splits: input.splits.map((_, index) => `/input/split-${index}.apk`),
			bundles: bundles.map((_, index) => `/input/bundle-${index}.reseam`),
		};
		if (bundles.length === 0) {
			this.phase = { name: 'empty' };
			this.notice = 'Add a patch bundle, or retry the Reseam patches.';
			return;
		}
		try {
			await this.openSession([]);
			void this.session!.warmup().catch((error) => this.write(String(error)));
			const inspection = await this.session!.inspect({
				apk_path: this.paths.apk,
				split_paths: this.paths.splits,
				bundle_paths: this.paths.bundles,
			});
			if (this.input !== input) return;
			this.inspection = inspection;
			this.ignoreVersions = false;
			this.drafts.clear();
			for (const patch of inspection.patches) {
				for (const option of patch.options) this.setDraft(patch, option.key, initialDraft(option));
			}
			this.choosePreset('recommended');
			this.phase = { name: 'ready' };
		} catch (error) {
			if (this.input !== input) return;
			await this.closeSession();
			this.input = null;
			this.notice = describe(error, this.patchName);
			this.phase = { name: 'empty' };
		}
	}

	private async openSession(extra: MountedFile[]) {
		this.session = await BrowserSession.open([...this.files, ...extra], {
			javaRuntime: this.java,
			signal: this.controller.signal,
			onLog: (message) => this.write(message),
			onEvent: (event) => this.track(event),
		});
	}

	private async closeSession() {
		const session = this.session;
		this.session = null;
		await session?.dispose().catch((error) => this.write(String(error)));
	}

	private track(event: RunEvent) {
		switch (event.type) {
			case 'info':
				this.write(event.message);
				if (event.message.startsWith('Opening APK')) this.reach('reading');
				else if (event.message.startsWith('Loading bundles')) this.reach('loading');
				else if (event.message.startsWith('Writing signed output')) this.reach('writing');
				return;
			case 'patch_log':
				if (event.level !== 'DEBUG') this.write(`${this.patchName(event.patch)}: ${event.message}`);
				return;
			case 'patch_started':
				this.reach('applying');
				if (this.phase.name === 'patching') this.phase.current = this.patchName(event.patch);
				return;
			case 'patch_finished': {
				// The engine reports every patch in its bundles; only this run's listed patches matter,
				// plus any hidden dependency that failed.
				const listed = this.running.has(event.patch) && !this.isHidden(event.patch);
				if (!listed && event.status.kind !== 'failed') return;
				this.runs.push({ reference: event.patch, status: event.status });
				this.write(this.describeRun(event.patch, event.status));
				if (this.phase.name !== 'patching' || !listed) return;
				this.phase.finished += 1;
				this.phase.total = Math.max(this.phase.total, this.phase.finished);
				return;
			}
		}
	}

	private describeRun(patch: string, status: PatchStatus): string {
		const name = this.patchName(patch);
		switch (status.kind) {
			case 'applied':
				return `Applied ${name}`;
			case 'skipped':
				return `Skipped ${name}: ${status.reason}`;
			case 'failed':
				return `Failed ${name}: ${status.reason}`;
		}
	}

	private isHidden(key: string) {
		return this.inspection?.patches.find((patch) => reference(patch) === key)?.hidden ?? false;
	}

	private reach(stage: Stage) {
		const phase = this.phase;
		if (phase.name !== 'patching' || phase.marks[stage] !== undefined) return;
		phase.marks[stage] = this.elapsed();
		phase.stage = stage;
	}

	private report(): Report {
		const milliseconds = this.elapsed();
		const marks = this.phase.name === 'patching' ? this.phase.marks : {};
		const reached = STAGES.filter(({ stage }) => marks[stage] !== undefined);
		return {
			milliseconds,
			stages: reached.map(({ stage }, index) => ({
				stage,
				milliseconds: (marks[reached[index + 1]?.stage] ?? milliseconds) - marks[stage]!,
			})),
			patches: this.runs,
		};
	}

	private elapsed() {
		return performance.now() - this.started;
	}

	private write(line: string) {
		const prefix =
			this.phase.name === 'patching' ? `${(this.elapsed() / 1000).toFixed(1).padStart(5)}s  ` : '';
		this.log.push(prefix + line);
		if (this.log.length > 2000) this.log.splice(0, this.log.length - 2000);
	}
}
