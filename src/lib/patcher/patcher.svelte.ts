import {
	BrowserSession,
	EngineError,
	EngineTools,
	JavaRuntime,
	runtime,
	type Artifact,
	type BundleMetadata,
	type InspectResponse,
	type MountedFile,
	type OptionValue,
	type PatchMetadata,
	type PatchPhase,
	type PatchPreset,
	type PatchResult,
	type PatchSelection,
	type PatchStatus,
	type RunEvent,
	type SelectionPlan,
} from '@reseam/browser';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { asset } from '$app/paths';
import { settings } from '#lib/settings.svelte.ts';
import { duration } from '#lib/format.ts';
import { fingerprint } from './files';
import { sortFiles, type AppInput } from './inputs';
import { fetchOfficialBundle, OFFICIAL_SIGNER, type OfficialBundle } from './official';
import { draftProblem, draftValue, initialDraft, problemText, type OptionDraft } from './options';
import { describe } from './problems';
import { reference } from './patches';
import * as storage from './storage';

export const STAGES = [
	{ stage: 'starting', label: 'Starting up' },
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
	| {
			name: 'done';
			apks: Artifact[];
			results: PatchResult[];
			/** Shown patches that failed, or needed one that did, which the app was built without. */
			leftOut: string[];
			report: Report;
			newKey: boolean;
	  }
	| { name: 'failed'; message: string; report: Report };

export type Official =
	{ status: 'loading' } | { status: 'ready'; bundle: OfficialBundle } | { status: 'failed' };

/** The engine's plan of the choice, or why it cannot plan it, such as two bundles declaring one patch. */
export type Planning =
	{ status: 'planned'; plan: SelectionPlan } | { status: 'failed'; problem: string };

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

/** The engine's stage for each phase it reports; opening the app happens before the run. */
const PHASE_STAGES: Partial<Record<PatchPhase, Stage>> = {
	load_bundles: 'loading',
	apply_patches: 'applying',
	write_unsigned_artifacts: 'writing',
};

const recommended = (): PatchSelection => ({
	preset: 'recommended',
	enable: [],
	disable: [],
	options: {},
	ignore_versions: false,
});

export class Patcher {
	phase = $state<Phase>({ name: 'empty' });
	official = $state<Official>({ status: 'loading' });
	bundles = $state<File[]>([]);
	input = $state<AppInput | null>(null);
	inspection = $state<InspectResponse | null>(null);
	/** Bundles read without an app, so added bundles show their name or problem before an app is chosen. */
	bundleCheck = $state<BundleMetadata[] | null>(null);
	checking = $state(false);
	notice = $state<string | null>(null);
	/** The user's choice: a preset with the patches they turned on or off. Options live in [drafts]. */
	choice = $state<PatchSelection>(recommended());
	readonly drafts = new SvelteMap<string, OptionDraft>();
	readonly trusted = new SvelteSet<string>([OFFICIAL_SIGNER]);
	signingKey = $state<{ fingerprint: string } | null>(null);
	log = $state<string[]>([]);

	/** What the choice runs, as the engine plans it. */
	readonly planning = $derived(this.planChoice());
	readonly planned = $derived(
		new Map(
			(this.planning?.status === 'planned' ? this.planning.plan.patches : []).map((patch) => [
				patch.patch,
				patch,
			])
		)
	);
	readonly listed = $derived(
		(this.inspection?.patches ?? []).filter(
			(patch) => !patch.hidden && this.planned.has(reference(patch))
		)
	);
	readonly running = $derived(
		new Set(
			[...this.planned.values()]
				.filter((patch) => patch.run.kind === 'runs')
				.map((patch) => patch.patch)
		)
	);
	/** The preset the choice is, or none when the user changed it. */
	readonly activePreset = $derived(
		this.choice.enable.length === 0 && this.choice.disable.length === 0
			? this.choice.preset
			: undefined
	);
	readonly untrusted = $derived(
		(this.inspection?.bundles ?? []).filter(
			(bundle) => !bundle.problem && !this.trusted.has(bundle.public_key)
		)
	);
	readonly blocker = $derived(this.findBlocker());

	// scripts/copy-runtime.ts serves the package's runtime files as static assets; asset() only
	// resolves files, so the runtime folder is found through one of them.
	private readonly runtimeBase = new URL(
		'.',
		new URL(asset(`${runtime.base}methods.json` as const), location.href)
	).href;
	private readonly java = new JavaRuntime({ runtimeBase: this.runtimeBase });
	private tools = $state.raw<EngineTools | null>(null);
	private session: BrowserSession | null = null;
	private controller = new AbortController();
	private files: MountedFile[] = [];
	private paths = { apk: '', splits: [] as string[], bundles: [] as string[] };
	private started = 0;
	private runs: PatchRun[] = [];

	async start() {
		// Java takes seconds to start cold; starting it with the page hides that.
		void this.java.warmup().catch((error) => this.write(String(error)));
		const [trusted, key, tools] = await Promise.all([
			storage.load('trusted-signers'),
			storage.load('identity'),
			EngineTools.load(this.runtimeBase),
		]);
		this.tools = tools;
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
		await this.refresh();
	}

	async choose(files: File[]) {
		const sorted = sortFiles(files);
		this.notice = sorted.error ?? null;
		if (sorted.error) return;
		this.bundles = [...this.bundles, ...sorted.bundles];
		if (sorted.input) this.input = sorted.input;
		await this.refresh();
	}

	async removeBundle(file: File) {
		this.bundles = this.bundles.filter((bundle) => bundle !== file);
		await this.refresh();
	}

	async clearApp() {
		await this.closeSession();
		this.input = null;
		this.inspection = null;
		this.notice = null;
		this.phase = { name: 'empty' };
		await this.refresh();
	}

	patchName = (key: string) =>
		this.inspection?.patches.find((patch) => reference(patch) === key)?.name ??
		key.split('/').at(-1)!;

	/** Turns a chosen patch off, or an unchosen one on, as a change to the choice's preset. */
	toggle(patch: PatchMetadata) {
		const key = reference(patch);
		const planned = this.planned.get(key);
		if (!planned) return;
		const byPreset = planned.presets.includes(this.choice.preset);
		const enable = this.choice.enable.filter((entry) => entry !== key);
		const disable = this.choice.disable.filter((entry) => entry !== key);
		this.choice = planned.selected
			? { ...this.choice, enable, disable: byPreset ? [...disable, key] : disable }
			: { ...this.choice, enable: byPreset ? enable : [...enable, key], disable };
	}

	choosePreset(value: PatchPreset) {
		this.choice = { ...this.choice, preset: value, enable: [], disable: [] };
	}

	allowAnyVersion(value: boolean) {
		this.choice = { ...this.choice, ignore_versions: value };
	}

	draft(patch: PatchMetadata, option: string): OptionDraft {
		return this.drafts.get(draftKey(reference(patch), option))!;
	}

	setDraft(patch: PatchMetadata, option: string, draft: OptionDraft) {
		this.drafts.set(draftKey(reference(patch), option), draft);
	}

	optionError(patch: PatchMetadata, option: string): string | null {
		const declaration = patch.options.find((candidate) => candidate.key === option)!;
		const typed = this.tools && draftProblem(this.tools, declaration, this.draft(patch, option));
		const planned = this.planned
			.get(reference(patch))
			?.option_problems.find((issue) => issue.key === option)?.problem;
		const problem = typed ?? planned;
		return problem ? problemText(problem) : null;
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
				selection: { ...$state.snapshot(this.choice), options },
				// Split apps come out as one .apks file, which the engine writes.
				output:
					(this.inspection.apk?.component_count ?? 1) > 1
						? { kind: 'split_archive', path: '/output/patched.apks' }
						: { kind: 'auto', path: '/output/patched' },
				signing: { kind: 'files', key: '/identity/reseam.pk8', cert: '/identity/reseam.der' },
				dry_run: false,
				install_method: 'install',
				leave_out_failed: true,
				trace: false,
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
				leftOut: outcome.results
					.filter((result) => !result.hidden && result.status.kind !== 'applied')
					.map((result) => result.patch),
				report: this.report(),
				newKey: !stored,
			};
		} catch (error) {
			if (this.controller.signal.aborted) {
				this.notice = 'Patching was cancelled.';
				this.phase = { name: 'ready' };
			} else {
				this.write(describe(error, this.patchName));
				this.phase = {
					name: 'failed',
					message: describe(error, this.patchName),
					report: this.report(),
				};
			}
			await this.closeSession();
		}
	}

	cancel() {
		this.controller.abort();
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

	private engineTools(): EngineTools {
		if (!this.tools) throw new Error('The patcher is still starting.');
		return this.tools;
	}

	/** Plans the choice with every option value the user set; the engine ignores those of patches that stay off. */
	private planChoice(): Planning | null {
		const inspection = this.inspection;
		const apk = inspection?.apk;
		if (!this.tools || !inspection || !apk) return null;
		try {
			const plan = this.tools.plan({
				patches: inspection.patches,
				app: {
					package_name: apk.package_name,
					version_name: apk.version_name,
					version_code: apk.version_code,
				},
				selection: {
					...$state.snapshot(this.choice),
					options: this.chosenOptions(inspection.patches).options,
				},
				install_method: 'install',
			});
			return { status: 'planned', plan };
		} catch (error) {
			if (!(error instanceof EngineError)) throw error;
			return { status: 'failed', problem: describe(error, this.patchName) };
		}
	}

	private findBlocker(): string | null {
		if (!this.inspection) return 'Choose an app first.';
		if (this.inspection.bundles.some((bundle) => bundle.problem)) {
			return 'Remove the patch bundle that could not be read.';
		}
		if (this.untrusted.length > 0) return 'Trust or remove the other patch signers first.';
		if (this.planning?.status === 'failed') return "These patches can't be combined.";
		if (!this.listed.some((patch) => this.running.has(reference(patch))))
			return 'Choose at least one patch.';
		const invalid = this.listed.filter(
			(patch) =>
				this.running.has(reference(patch)) &&
				patch.options.some((option) => this.optionError(patch, option.key))
		);
		if (invalid.length > 0) return `Fill in the options for ${invalid[0].name}.`;
		return null;
	}

	/** The options a run takes: only those of the patches the plan takes up. */
	private selectedOptions() {
		const taken = new Set(
			[...this.planned.values()]
				.filter((patch) => patch.run.kind !== 'off')
				.map((patch) => patch.patch)
		);
		return this.chosenOptions(
			(this.inspection?.patches ?? []).filter((patch) => taken.has(reference(patch)))
		);
	}

	/** The option values the user set on `patches`, and the files they name. */
	private chosenOptions(patches: PatchMetadata[]) {
		const options: Record<string, Record<string, OptionValue>> = {};
		const uploads: MountedFile[] = [];
		let index = 0;
		for (const patch of patches) {
			const key = reference(patch);
			for (const option of patch.options) {
				const resolved = draftValue(
					this.engineTools(),
					option,
					this.draft(patch, option.key),
					`options/${index++}`
				);
				if (!resolved) continue;
				(options[key] ??= {})[option.key] = resolved.value;
				uploads.push(...resolved.uploads);
			}
		}
		return { options, uploads };
	}

	/** Reads the app with every bundle, or only the added bundles while no app is chosen. */
	private async refresh() {
		if (this.input) await this.inspect(this.input);
		else if (this.bundles.length > 0) await this.inspect(null);
		else this.bundleCheck = null;
	}

	private async inspect(input: AppInput | null) {
		if (input) this.phase = { name: 'reading' };
		this.inspection = null;
		this.bundleCheck = null;
		this.notice = null;
		await this.closeSession();
		// loadOfficial inspects again once the official bundle settles.
		if (this.official.status === 'loading') return;
		this.controller = new AbortController();
		const extension = input?.app.name.split('.').at(-1)!.toLowerCase();
		const bundles = [
			...(this.official.status === 'ready' ? [this.official.bundle.file] : []),
			...this.bundles,
		];
		this.files = [
			...(input
				? [
						{ name: `app.${extension}`, file: input.app },
						...input.splits.map((file, index) => ({ name: `split-${index}.apk`, file })),
					]
				: []),
			...bundles.map((file, index) => ({ name: `bundle-${index}.reseam`, file })),
		];
		this.paths = {
			apk: input ? `/input/app.${extension}` : '',
			splits: input ? input.splits.map((_, index) => `/input/split-${index}.apk`) : [],
			bundles: bundles.map((_, index) => `/input/bundle-${index}.reseam`),
		};
		if (bundles.length === 0) {
			this.phase = { name: 'empty' };
			this.notice = 'Add a patch bundle, or retry the Reseam patches.';
			return;
		}
		this.checking = true;
		try {
			await this.openSession([]);
			if (input) void this.session!.warmup().catch((error) => this.write(String(error)));
			const inspection = await this.session!.inspect({
				apk_path: input ? this.paths.apk : null,
				split_paths: this.paths.splits,
				bundle_paths: this.paths.bundles,
				trust: { keys: [...this.trusted] },
			});
			if (this.input !== input) return;
			if (!input) {
				this.bundleCheck = inspection.bundles;
				await this.closeSession();
				return;
			}
			this.drafts.clear();
			for (const patch of inspection.patches) {
				for (const option of patch.options)
					this.setDraft(patch, option.key, initialDraft(this.engineTools(), option));
			}
			this.choice = recommended();
			this.inspection = inspection;
			this.phase = { name: 'ready' };
		} catch (error) {
			if (this.input !== input) return;
			await this.closeSession();
			this.input = null;
			this.notice = describe(error, this.patchName);
			this.phase = { name: 'empty' };
		} finally {
			if (this.input === input) this.checking = false;
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
				return;
			case 'phase_started': {
				const stage = PHASE_STAGES[event.phase];
				if (stage) this.reach(stage);
				return;
			}
			case 'patch_log':
				if (event.level !== 'DEBUG') this.write(`${this.patchName(event.patch)}: ${event.message}`);
				return;
			case 'patch_started':
				if (this.phase.name === 'patching' && !this.isHidden(event.patch))
					this.phase.current = this.patchName(event.patch);
				return;
			case 'patch_finished': {
				const listed = !this.isHidden(event.patch);
				if (!listed && event.status.kind !== 'failed') return;
				this.runs.push({ reference: event.patch, status: event.status });
				this.write(this.describeRun(event.patch, event.status));
				if (this.phase.name !== 'patching' || !listed) return;
				this.phase.finished += 1;
				this.phase.total = Math.max(this.phase.total, this.phase.finished);
				return;
			}
			case 'patches_reverted': {
				const reverted = new Set(event.patches);
				const listed = this.runs.filter(
					(run) => reverted.has(run.reference) && !this.isHidden(run.reference)
				);
				this.runs = this.runs.filter((run) => !reverted.has(run.reference));
				this.write(`Running ${event.patches.length} patches again`);
				if (this.phase.name === 'patching') this.phase.finished -= listed.length;
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
			case 'unmountable':
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
