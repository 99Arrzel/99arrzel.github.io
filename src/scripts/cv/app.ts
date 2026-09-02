// Wiring. Everything stateful lives here; the modules it calls are pure.

import { BLANK_CV, DEFAULT_CV, DEFAULT_CV_ES } from './default-cv';
import { extractText, hasColumns, wordCount } from './extract';
import { applyAction, applyKind, applyRail, autosize, autosizeAll, renderForm, setPath } from './form';
import { cvLang, s as strings } from './i18n';
import { lint, type Diagnostic } from './lint';
import { parseResume } from './parse';
import { photoBytes, readPhoto } from './photo';
import { buildPrompt, cleanLlmReply, looksLikeCv } from './prompt';
import { printSheet, suggestFilename } from './print';
import { renderSheet, type SheetExtras } from './render';
import { serializeResume } from './serialize';
import { alnumSegment, byteSegment, encodeSegments, qrToSvg } from './qr';
import {
	buildShareUrl,
	canCompress,
	decodePayload,
	encodePayload,
	payloadCodec,
	qrPayload,
	readShareParam,
} from './share';
import { digest, shorten } from './tinyurl';
import {
	loadDocs,
	makeDoc,
	markSeen,
	saveDocs,
	seen,
	setActiveId,
	STORAGE_KEYS,
	type Doc,
} from './store';
import { TEMPLATES, type DensityId, type PageId, type Resume, type SectionKind, type TemplateId } from './types';

type Tab = 'form' | 'markdown' | 'ats';

const el = <T extends HTMLElement>(id: string): T | null => document.getElementById(id) as T | null;

export function boot(): void {
	const root = el<HTMLElement>('cv-app');
	if (!root) return;

	const T = strings().app;

	// ── DOM handles ──────────────────────────────────────────────────
	const formRoot = el<HTMLElement>('form-root');
	const mdInput = el<HTMLTextAreaElement>('md-input');
	const atsText = el<HTMLElement>('ats-text');
	const atsIssues = el<HTMLElement>('ats-issues');
	const atsMeta = el<HTMLElement>('ats-meta');
	const preview = el<HTMLElement>('preview');
	const fit = el<HTMLElement>('sheet-fit');
	const shell = el<HTMLElement>('sheet-shell');
	const pageCount = el<HTMLElement>('pagecount');
	const saveState = el<HTMLElement>('save-state');
	const docSelect = el<HTMLSelectElement>('doc-select');
	const docName = el<HTMLInputElement>('doc-name');
	const pageSelect = el<HTMLSelectElement>('page-select');
	const densitySelect = el<HTMLSelectElement>('density-select');
	const accentInput = el<HTMLInputElement>('accent-input');
	const tplPicker = el<HTMLElement>('tpl-picker');
	const issueCount = el<HTMLElement>('issue-count');
	const tips = el<HTMLElement>('tips');
	const sheetCssEl = el<HTMLElement>('sheet-css');
	const qrOn = el<HTMLInputElement>('qr-on');
	const qrEvery = el<HTMLInputElement>('qr-every');
	const qrHash = el<HTMLInputElement>('qr-hash');
	const qrSize = el<HTMLInputElement>('qr-size');
	const qrSizeOut = el<HTMLElement>('qr-size-out');
	const qrReadout = el<HTMLElement>('qr-readout');
	const shareBanner = el<HTMLElement>('share-banner');
	const shortenBtn = el<HTMLButtonElement>('qr-shorten');
	const shortState = el<HTMLElement>('qr-short-state');

	if (!formRoot || !mdInput || !preview || !fit || !shell) return;

	const SHEET_CSS = sheetCssEl?.textContent ?? '';

	// ── State ────────────────────────────────────────────────────────
	// The seed document is the file, not a saved copy. It is refreshed from the
	// bundled CV on every load and made active, so editing default-cv.ts shows up
	// on reload and a stale localStorage copy can never shadow it. Documents the
	// visitor creates are untouched and stay in the switcher; anything typed into
	// the seed itself is replaced next load, which is what New and Duplicate are
	// for. The Spanish page seeds its own document, so the two never collide.
	const seedMarkdown = cvLang() === 'es' ? DEFAULT_CV_ES : DEFAULT_CV;
	const seedName = cvLang() === 'es' ? 'Mi CV' : 'My CV';

	let docs: Doc[] = loadDocs();
	let seed = docs.find((d) => d.name === seedName);
	if (seed) {
		seed.markdown = seedMarkdown;
		seed.updatedAt = Date.now();
	} else {
		seed = makeDoc(seedName, seedMarkdown);
		docs.unshift(seed);
	}
	saveDocs(docs);
	setActiveId(seed.id);

	let activeId = seed.id;
	let markdown = seedMarkdown;
	let resume: Resume = parseResume(markdown);
	let tab: Tab = 'markdown';
	let formStale = false;
	let saveTimer = 0;
	let renderTimer = 0;

	// ── Rendering ────────────────────────────────────────────────────
	const pageProbe = document.createElement('div');
	pageProbe.style.cssText = 'position:absolute;visibility:hidden;width:1px;';
	document.body.appendChild(pageProbe);
	// Fractional, not offsetHeight: A4 is 1122.52px at 96dpi, and rounding that
	// to 1123 would drift the QR stamps a pixel per page.
	const pageHeightPx = (page: PageId): number => {
		pageProbe.style.height = page === 'A4' ? '297mm' : '11in';
		return pageProbe.getBoundingClientRect().height || 1122.52;
	};
	const mmToPx = (mm: number): number => {
		pageProbe.style.height = `${mm}mm`;
		return pageProbe.getBoundingClientRect().height;
	};

	/** Base URL a scanned code should land on, e.g. https://site/cv */
	function shareBase(): string {
		return `${location.origin}${location.pathname.replace(/\/+$/, '')}` || location.origin;
	}

	type QrBuild = {
		svg: string;
		sizePx: number;
		caption: string;
		version: number;
		modules: number;
		chars: number;
		shortened: boolean;
		codec: string;
		payloadChars: number;
	};

	let qrError = '';
	let shortStale = false;

	async function buildQr(): Promise<QrBuild | null> {
		qrError = '';
		if (!resume.settings.qr) return null;
		if (!canCompress()) {
			qrError = T.qrNoCompression;
			return null;
		}
		let info: Awaited<ReturnType<typeof qrPayload>>;
		try {
			info = await qrPayload(markdown, shareBase(), resume.settings.qrHash);
		} catch {
			qrError = T.qrCompressFailed;
			return null;
		}

		// A short link is only used while it still matches the current CV. If the
		// document has been edited since it was made, fall back to the
		// self-contained link — a big code that is right beats a small one that
		// points at last week's CV.
		const fresh = digest(info.alnum);
		const short = resume.settings.qrShort;
		const shortUsable = !!short && resume.settings.qrShortFor === fresh;
		shortStale = !!short && !shortUsable;

		// Short links are plain lowercase URLs, so they go in one byte segment;
		// the self-contained link splits into a byte prefix plus an alphanumeric
		// payload, which is what lets a whole CV fit at all (see share.ts).
		// ECC L on the short link so a 28-character URL lands in a version 2
		// symbol — 25 modules. At the sizes that implies (0.7 mm per module and
		// up) the code is geometrically robust, so the lower redundancy costs
		// nothing in practice; M would push it to version 3.
		const qr = shortUsable
			? encodeSegments([byteSegment(short)], 'L')
			: encodeSegments([byteSegment(info.prefix), alnumSegment(info.alnum)], 'L');
		if (!qr) {
			qrError = T.qrTooLong(info.alnum.length);
			return null;
		}
		return {
			svg: qrToSvg(qr, { size: '100%', quiet: 4 }),
			sizePx: mmToPx(resume.settings.qrSize),
			caption: strings().render.qrCaption,
			version: qr.version,
			modules: qr.size,
			chars: shortUsable ? short.length : info.text.length,
			shortened: shortUsable,
			codec: payloadCodec(info.alnum),
			payloadChars: info.alnum.length,
		};
	}

	function topWithin(el: HTMLElement, root: HTMLElement): number {
		let y = 0;
		let node: HTMLElement | null = el;
		while (node && node !== root) {
			y += node.offsetTop;
			node = node.offsetParent as HTMLElement | null;
		}
		return y;
	}

	/**
	 * Push content out of the code's corner.
	 *
	 * The stamp is absolutely positioned, so it displaces nothing — printed as-is
	 * it lands on top of the bullets. There is no CSS that reserves a per-page
	 * region in a continuous flow, so the space is taken by inserting spacers
	 * ahead of the first block that would collide, which moves that block past
	 * the band. Returns true if anything moved, so the caller can re-measure.
	 */
	function reserveBands(sheet: HTMLElement, bands: { top: number; bottom: number }[]): boolean {
		const body = sheet.querySelector<HTMLElement>('.cv-body') ?? sheet;
		let moved = false;
		for (let pass = 0; pass < 12; pass++) {
			const blocks = Array.from(
				body.querySelectorAll<HTMLElement>('.cv-entry, .cv-bullets > li, .cv-items > li, .cv-skill, .cv-text, .cv-sec > h2'),
			);
			let didThisPass = false;
			for (const band of bands) {
				for (const b of blocks) {
					if (b.dataset.kept === '1') continue;
					const top = topWithin(b, sheet);
					const bottom = top + b.offsetHeight;
					if (bottom <= band.top || top >= band.bottom) continue;
					const spacer = document.createElement('div');
					spacer.className = 'cv-keepout';
					spacer.style.height = `${Math.ceil(band.bottom - top)}px`;
					b.parentElement?.insertBefore(spacer, b);
					b.dataset.kept = '1';
					didThisPass = true;
					moved = true;
					break;
				}
				if (didThisPass) break;
			}
			if (!didThisPass) break;
		}
		return moved;
	}

	function reportQr(build: QrBuild | null): void {
		if (!qrReadout) return;
		if (qrError) {
			qrReadout.textContent = qrError;
			qrReadout.dataset.level = 'bad';
			return;
		}
		if (!build) {
			qrReadout.textContent = T.qrOff;
			qrReadout.dataset.level = 'off';
			return;
		}
		// The printed square includes a 4-module quiet zone on each side.
		const perModule = resume.settings.qrSize / (build.modules + 8);
		const verdict =
			perModule < 0.25
				? [T.qrVerdictBad, 'bad']
				: perModule < 0.33
					? [T.qrVerdictWarn, 'warn']
					: perModule < 0.5
						? [T.qrVerdictOk, 'ok']
						: [T.qrVerdictGreat, 'ok'];
		const source = build.shortened
			? T.qrSourceShort(build.chars)
			: T.qrSourceSelf(build.payloadChars, build.codec);
		qrReadout.textContent = T.qrReadout(
			source,
			build.version,
			build.modules,
			perModule.toFixed(2),
			resume.settings.qrSize,
			verdict[0],
		);
		qrReadout.dataset.level = verdict[1];
		if (shortState) {
			shortState.textContent = shortStale
				? T.shortStale
				: build.shortened
					? T.shortenedTo(resume.settings.qrShort)
					: '';
			shortState.dataset.level = shortStale ? 'warn' : 'ok';
			shortState.hidden = !shortState.textContent;
		}
	}

	function fitPreview(): void {
		const sheet = shell!.querySelector<HTMLElement>('.sheet');
		if (!sheet) return;
		const w = sheet.offsetWidth;
		const h = shell!.offsetHeight;
		if (!w || !h) return;
		const avail = preview!.clientWidth - 32;
		const scale = Math.min(1, avail / w);
		shell!.style.transform = `scale(${scale})`;
		fit!.style.width = `${w * scale}px`;
		fit!.style.height = `${h * scale}px`;
	}

	async function renderPreview(): Promise<void> {
		const build = await buildQr();
		const pageH = pageHeightPx(resume.settings.page);

		// Pass 1: lay the sheet out with a single stamp so its height can be
		// measured, then pass 2 places one stamp per page from that height.
		const extras: SheetExtras = build
			? { qr: { svg: build.svg, tops: [0], sizePx: build.sizePx, caption: build.caption } }
			: {};
		shell!.innerHTML = renderSheet(resume, extras);
		const sheet = shell!.querySelector<HTMLElement>('.sheet');
		if (!sheet) return;

		// Natural content height first — the CSS min-height would mask it.
		sheet.style.minHeight = '0px';
		const contentH = sheet.offsetHeight;
		let pages = Math.max(1, Math.ceil((contentH - 4) / pageH));
		// Reserving space for a stamp adds height, so the fill readout is taken
		// from whatever the content measures *after* that.
		let usedH = contentH;
		// Pad the sheet to a whole number of pages so "bottom of the sheet" and
		// "bottom of the last page" are the same line, which is what lets a
		// stamp sit in the corner rather than wherever the text happened to end.
		sheet.style.minHeight = `${pages * pageH - 0.5}px`;

		const stamp = sheet.querySelector<HTMLElement>('.cv-qr');
		const stampH = stamp ? stamp.offsetHeight : build ? build.sizePx : 0;
		const stampMargin = mmToPx(10);
		// The sheet's padding is on the box, so CSS lays it down once at the very
		// top and once at the very bottom of the whole document — never at an
		// internal page break. Left alone, text runs into the physical edge of
		// page one and starts hard against the edge of page two. Reserving a band
		// straddling each break gives the bottom of one page and the top of the
		// next the same margin as the rest of the sheet.
		const edge = Number.parseFloat(getComputedStyle(sheet).paddingBottom) || mmToPx(15);

		{
			// Reserving space can push content onto another page, which moves every
			// band — so re-measure until the page count settles.
			let settled = pages;
			for (let attempt = 0; attempt < 6; attempt++) {
				for (const old of Array.from(sheet.querySelectorAll('.cv-keepout'))) old.remove();
				for (const kept of Array.from(sheet.querySelectorAll<HTMLElement>('[data-kept]'))) delete kept.dataset.kept;

				const bands: { top: number; bottom: number }[] = [];
				for (let i = 1; i < settled; i++) {
					bands.push({ top: i * pageH - edge, bottom: i * pageH + edge });
				}
				if (build) {
					const targets = resume.settings.qrEvery ? Array.from({ length: settled }, (_, i) => i) : [settled - 1];
					for (const i of targets) {
						bands.push({ top: (i + 1) * pageH - stampMargin - stampH, bottom: (i + 1) * pageH });
					}
				}

				sheet.style.minHeight = '0px';
				reserveBands(sheet, bands);
				usedH = sheet.offsetHeight;
				const grown = Math.max(1, Math.ceil((usedH - 4) / pageH));
				if (grown === settled) break;
				settled = grown;
			}
			pages = settled;
			sheet.style.minHeight = `${pages * pageH - 0.5}px`;
		}

		if (build) {
			const targets = resume.settings.qrEvery ? Array.from({ length: pages }, (_, i) => i) : [pages - 1];
			const tops = targets.map((i) => (i + 1) * pageH - stampMargin - stampH);
			for (const node of Array.from(sheet.querySelectorAll<HTMLElement>('.cv-qr'))) node.remove();
			for (const top of tops) {
				const holder = document.createElement('div');
				holder.innerHTML = renderSheet(
					{ ...resume, sections: [] },
					{ qr: { svg: build.svg, tops: [top], sizePx: build.sizePx, caption: build.caption } },
				);
				const node = holder.querySelector('.cv-qr');
				if (node) sheet.appendChild(node);
			}
		}
		reportQr(build);

		const finalSheet = shell!.querySelector<HTMLElement>('.sheet');
		if (!finalSheet) return;

		// Guides sit inside the scaled shell, so they scale with the paper.
		for (let i = 1; i < pages; i++) {
			const guide = document.createElement('div');
			guide.className = 'page-guide';
			guide.style.top = `${i * pageH}px`;
			guide.dataset.label = T.pageGuide(i + 1);
			shell!.appendChild(guide);
		}

		if (pageCount) {
			// Measured from the content, not the sheet: the sheet is padded out to
			// a whole number of pages so the QR stamp can sit in the corner, which
			// would otherwise make every document report "100% full".
			const lastFill = Math.max(0, Math.round(((usedH - (pages - 1) * pageH) / pageH) * 100));
			pageCount.textContent = pages === 1 ? T.pageOne(lastFill) : T.pageMany(pages, lastFill);
			pageCount.dataset.over = String(pages > 2);
		}

		fitPreview();

		const extracted = extractText(finalSheet);
		if (atsText) atsText.textContent = extracted;
		if (atsMeta) {
			atsMeta.textContent = T.atsMeta(wordCount(extracted));
		}

		const density = build ? resume.settings.qrSize / (build.modules + 8) : null;
		const issues = lint(resume, {
			pages,
			extracted,
			interleaved: hasColumns(finalSheet),
			qrDensity: density,
			qrStale: shortStale,
		});
		renderIssues(issues);
	}

	function renderIssues(issues: Diagnostic[]): void {
		if (issueCount) {
			const errors = issues.filter((d) => d.level === 'error').length;
			const warns = issues.filter((d) => d.level === 'warn').length;
			issueCount.textContent = issues.length ? String(errors + warns || issues.length) : '';
			issueCount.hidden = !issues.length;
			issueCount.dataset.level = errors ? 'error' : warns ? 'warn' : 'info';
		}
		if (!atsIssues) return;
		if (!issues.length) {
			atsIssues.innerHTML = `<p class="ats-clean">${escapeHtml(T.atsClean)}</p>`;
			return;
		}
		atsIssues.innerHTML = issues
			.map(
				(d) =>
					`<div class="issue is-${d.level}">` +
					`<span class="issue-tag">${d.level}</span>` +
					`<div><b>${escapeHtml(d.message)}</b>${d.hint ? `<span>${escapeHtml(d.hint)}</span>` : ''}</div>` +
					`</div>`,
			)
			.join('');
	}

	function escapeHtml(s: string): string {
		return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	function renderFormPane(focus?: string): void {
		formRoot!.innerHTML = renderForm(resume);
		autosizeAll(formRoot!);
		formStale = false;
		if (focus) {
			const target = formRoot!.querySelector<HTMLElement>(`[data-p="${CSS.escape(focus)}"]`);
			target?.focus();
		}
	}

	function syncToolbar(): void {
		if (pageSelect) pageSelect.value = resume.settings.page;
		if (densitySelect) densitySelect.value = resume.settings.density;
		if (accentInput) accentInput.value = normalizeHex(resume.settings.accent);
		if (qrOn) qrOn.checked = resume.settings.qr;
		if (qrEvery) qrEvery.checked = resume.settings.qrEvery;
		if (qrHash) qrHash.checked = resume.settings.qrHash;
		if (qrSize) qrSize.value = String(resume.settings.qrSize);
		if (qrSizeOut) qrSizeOut.textContent = `${resume.settings.qrSize} mm`;
		for (const node of [qrEvery, qrHash, qrSize]) node?.toggleAttribute('disabled', !resume.settings.qr);
		if (shortenBtn) shortenBtn.disabled = !resume.settings.qr;
		const unshorten = el<HTMLButtonElement>('qr-unshorten');
		if (unshorten) unshorten.hidden = !resume.settings.qrShort;
		if (tplPicker) {
			for (const b of Array.from(tplPicker.querySelectorAll<HTMLButtonElement>('[data-tpl]'))) {
				const on = b.dataset.tpl === resume.settings.template;
				b.classList.toggle('is-on', on);
				b.setAttribute('aria-pressed', String(on));
			}
		}
	}

	function normalizeHex(v: string): string {
		const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v.trim());
		if (!m) return '#2f62c8';
		if (m[1].length === 3) {
			const [a, b, c] = m[1].split('');
			return `#${a}${a}${b}${b}${c}${c}`.toLowerCase();
		}
		return `#${m[1]}`.toLowerCase();
	}

	// ── Persistence ──────────────────────────────────────────────────
	function markdownFromModel(): string {
		return serializeResume(resume);
	}

	function scheduleSave(): void {
		if (saveState) {
			saveState.textContent = T.saving;
			saveState.dataset.state = 'busy';
		}
		window.clearTimeout(saveTimer);
		saveTimer = window.setTimeout(() => {
			const doc = docs.find((d) => d.id === activeId);
			if (!doc) return;
			doc.markdown = markdown;
			doc.updatedAt = Date.now();
			const ok = saveDocs(docs);
			if (saveState) {
				saveState.textContent = ok ? T.saved : T.saveFailed;
				saveState.dataset.state = ok ? 'ok' : 'error';
			}
		}, 400);
	}

	function scheduleRender(): void {
		window.clearTimeout(renderTimer);
		renderTimer = window.setTimeout(() => void renderPreview(), 120);
	}

	/** Form edited: model is the source, markdown is derived. */
	function afterModelEdit(): void {
		markdown = markdownFromModel();
		if (tab === 'markdown') mdInput!.value = markdown;
		scheduleRender();
		scheduleSave();
	}

	/** Raw markdown edited: text is the source, model is derived. */
	function afterMarkdownEdit(): void {
		resume = parseResume(markdown);
		formStale = true;
		syncToolbar();
		scheduleRender();
		scheduleSave();
	}

	function loadDoc(id: string): void {
		const doc = docs.find((d) => d.id === id);
		if (!doc) return;
		activeId = id;
		setActiveId(id);
		markdown = doc.markdown;
		resume = parseResume(markdown);
		mdInput!.value = markdown;
		if (docName) docName.value = doc.name;
		syncToolbar();
		renderFormPane();
		void renderPreview();
	}

	function refreshDocList(): void {
		if (docSelect) {
			docSelect.innerHTML = docs
				.map((d) => `<option value="${escapeHtml(d.id)}"${d.id === activeId ? ' selected' : ''}>${escapeHtml(d.name)}</option>`)
				.join('');
		}
		const doc = docs.find((d) => d.id === activeId);
		if (docName && doc) docName.value = doc.name;
	}

	// ── Tabs ─────────────────────────────────────────────────────────
	function showTab(next: Tab): void {
		tab = next;
		for (const b of Array.from(document.querySelectorAll<HTMLButtonElement>('[data-tab]'))) {
			const on = b.dataset.tab === next;
			b.classList.toggle('is-on', on);
			b.setAttribute('aria-selected', String(on));
		}
		for (const p of Array.from(document.querySelectorAll<HTMLElement>('[data-pane]'))) {
			p.hidden = p.dataset.pane !== next;
		}
		if (next === 'markdown') {
			// Deliberately not autosized: growing it to fit the whole document is
			// what produced a second scrollbar. It flexes to the pane instead.
			mdInput!.value = markdown;
		}
		if (next === 'form' && formStale) renderFormPane();
	}

	// ── Events: the form ─────────────────────────────────────────────
	formRoot.addEventListener('input', (ev) => {
		const t = ev.target as HTMLElement | null;
		if (!t) return;
		const path = t.dataset.p;
		if (!path) return;
		const value = (t as HTMLInputElement | HTMLTextAreaElement).value;
		setPath(resume, path, value);
		if (t instanceof HTMLTextAreaElement) autosize(t);
		afterModelEdit();
	});

	formRoot.addEventListener('click', (ev) => {
		const btn = (ev.target as HTMLElement | null)?.closest<HTMLElement>('[data-act]');
		if (!btn || btn.tagName === 'SELECT' || btn.tagName === 'INPUT') return;
		const act = btn.dataset.act;
		if (!act) return;

		// Photo actions are async / need a file dialog, so they don't go through
		// the synchronous structural-action table.
		if (act === 'photo-pick') {
			formRoot.querySelector<HTMLInputElement>('[data-photo-input]')?.click();
			return;
		}
		if (act === 'photo-remove') {
			resume.profile.photo = '';
			afterModelEdit();
			renderFormPane();
			return;
		}
		const result = applyAction(resume, act, btn.dataset);
		if (!result) return;
		afterModelEdit();
		if (result.structural) renderFormPane(result.focus);
	});

	formRoot.addEventListener('change', (ev) => {
		const t = ev.target as HTMLElement | null;
		const act = t?.dataset.act;
		if (!t || !act) return;
		if (act === 'kind' && t instanceof HTMLSelectElement) {
			applyKind(resume, Number(t.dataset.i), t.value as SectionKind);
			afterModelEdit();
			renderFormPane();
		} else if (act === 'rail' && t instanceof HTMLInputElement) {
			applyRail(resume, Number(t.dataset.i), t.checked);
			afterModelEdit();
		} else if (act === 'photo-shape' && t instanceof HTMLSelectElement) {
			resume.settings.photoShape = t.value === 'square' ? 'square' : 'circle';
			afterModelEdit();
			renderFormPane();
		}
	});

	// Picking a photo: crop, downscale and re-encode before it enters the model.
	formRoot.addEventListener('change', async (ev) => {
		const input = ev.target as HTMLInputElement | null;
		if (!input || !('photoInput' in input.dataset)) return;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		try {
			const dataUrl = await readPhoto(file);
			resume.profile.photo = dataUrl;
			afterModelEdit();
			renderFormPane();
			if (saveState && photoBytes(dataUrl) > 250_000) {
				saveState.textContent = T.savedWithPhoto(Math.round(photoBytes(dataUrl) / 1024));
			}
		} catch (err) {
			window.alert(err instanceof Error ? err.message : T.photoUnreadable);
		}
	});

	// ── Events: raw markdown ─────────────────────────────────────────
	mdInput.addEventListener('input', () => {
		markdown = mdInput.value;
		afterMarkdownEdit();
	});

	// ── Events: toolbar ──────────────────────────────────────────────
	for (const b of Array.from(document.querySelectorAll<HTMLButtonElement>('[data-tab]'))) {
		b.addEventListener('click', () => showTab((b.dataset.tab as Tab) ?? 'markdown'));
	}

	tplPicker?.addEventListener('click', (ev) => {
		const btn = (ev.target as HTMLElement | null)?.closest<HTMLButtonElement>('[data-tpl]');
		if (!btn) return;
		resume.settings.template = (btn.dataset.tpl as TemplateId) ?? 'ledger';
		syncToolbar();
		afterModelEdit();
		// The sidebar checkboxes only exist under Rail.
		renderFormPane();
	});

	pageSelect?.addEventListener('change', () => {
		resume.settings.page = pageSelect.value as PageId;
		afterModelEdit();
	});
	densitySelect?.addEventListener('change', () => {
		resume.settings.density = densitySelect.value as DensityId;
		afterModelEdit();
	});
	accentInput?.addEventListener('input', () => {
		resume.settings.accent = accentInput.value;
		afterModelEdit();
	});

	// ── Events: the QR stamp ─────────────────────────────────────────
	qrOn?.addEventListener('change', () => {
		resume.settings.qr = qrOn.checked;
		syncToolbar();
		afterModelEdit();
	});
	qrEvery?.addEventListener('change', () => {
		resume.settings.qrEvery = qrEvery.checked;
		afterModelEdit();
	});
	qrHash?.addEventListener('change', () => {
		resume.settings.qrHash = qrHash.checked;
		afterModelEdit();
	});
	qrSize?.addEventListener('input', () => {
		resume.settings.qrSize = Number(qrSize.value);
		if (qrSizeOut) qrSizeOut.textContent = `${resume.settings.qrSize} mm`;
		afterModelEdit();
	});

	shortenBtn?.addEventListener('click', async () => {
		if (!canCompress()) return;
		const confirmed = window.confirm(T.shortenConfirm);
		if (!confirmed) return;

		shortenBtn.disabled = true;
		const previous = shortenBtn.textContent;
		shortenBtn.textContent = T.shortening;
		try {
			const payload = await encodePayload(markdown);
			const long = buildShareUrl(shareBase(), payload, resume.settings.qrHash);
			const result = await shorten(long);
			if ('error' in result) {
				if (shortState) {
					shortState.textContent = result.error;
					shortState.dataset.level = 'bad';
					shortState.hidden = false;
				}
				return;
			}
			resume.settings.qrShort = result.url;
			resume.settings.qrShortFor = digest(payload);
			if (!resume.settings.qr) resume.settings.qr = true;
			// A 28-character link is a v2 symbol; keeping it at 58mm would be absurd.
			if (resume.settings.qrSize > 32) resume.settings.qrSize = 24;
			syncToolbar();
			afterModelEdit();
		} finally {
			shortenBtn.disabled = false;
			shortenBtn.textContent = previous;
		}
	});

	el<HTMLButtonElement>('qr-unshorten')?.addEventListener('click', () => {
		resume.settings.qrShort = '';
		resume.settings.qrShortFor = '';
		if (resume.settings.qrSize < 40) resume.settings.qrSize = 58;
		syncToolbar();
		afterModelEdit();
	});

	el<HTMLButtonElement>('copy-link')?.addEventListener('click', async () => {
		if (!canCompress()) {
			window.alert(T.noCompressionShare);
			return;
		}
		try {
			const payload = await encodePayload(markdown);
			const url = buildShareUrl(shareBase(), payload, resume.settings.qrHash);
			await navigator.clipboard.writeText(url);
			if (saveState) {
				saveState.textContent = T.linkCopied(url.length);
				saveState.dataset.state = 'ok';
			}
		} catch {
			window.alert(T.linkFailed);
		}
	});

	// ── Events: documents ────────────────────────────────────────────
	docSelect?.addEventListener('change', () => loadDoc(docSelect.value));

	docName?.addEventListener('input', () => {
		const doc = docs.find((d) => d.id === activeId);
		if (!doc) return;
		doc.name = docName.value;
		refreshDocList();
		docName.focus();
		scheduleSave();
	});

	el<HTMLButtonElement>('doc-new')?.addEventListener('click', () => {
		const doc = makeDoc(T.untitledDoc, BLANK_CV);
		docs.push(doc);
		saveDocs(docs);
		refreshDocList();
		loadDoc(doc.id);
		refreshDocList();
		docName?.select();
	});

	el<HTMLButtonElement>('doc-dup')?.addEventListener('click', () => {
		const current = docs.find((d) => d.id === activeId);
		if (!current) return;
		const doc = makeDoc(T.copySuffix(current.name), markdown);
		docs.push(doc);
		saveDocs(docs);
		loadDoc(doc.id);
		refreshDocList();
		docName?.select();
	});

	el<HTMLButtonElement>('doc-del')?.addEventListener('click', () => {
		if (docs.length <= 1) {
			window.alert(T.onlyDoc);
			return;
		}
		const current = docs.find((d) => d.id === activeId);
		if (!current) return;
		if (!window.confirm(T.confirmDelete(current.name))) return;
		docs = docs.filter((d) => d.id !== activeId);
		saveDocs(docs);
		loadDoc(docs[0].id);
		refreshDocList();
	});

	// ── Events: print ────────────────────────────────────────────────
	el<HTMLButtonElement>('print-btn')?.addEventListener('click', () => {
		const live = shell.querySelector<HTMLElement>('.sheet');
		printSheet({
			sheetHtml: live ? live.outerHTML : renderSheet(resume),
			css: SHEET_CSS,
			page: resume.settings.page,
			title: suggestFilename(resume.profile.name, resume.profile.title),
		});
	});

	el<HTMLButtonElement>('tips-dismiss')?.addEventListener('click', () => {
		markSeen('printTips');
		if (tips) tips.hidden = true;
	});

	// ── "Let a chatbot write it" ─────────────────────────────────────
	const promptModal = el<HTMLDialogElement>('prompt-modal');
	const promptSource = el<HTMLTextAreaElement>('prompt-source');
	const promptPreview = el<HTMLElement>('prompt-preview');
	const promptResult = el<HTMLTextAreaElement>('prompt-result');
	const copyHint = el<HTMLElement>('prompt-copy-hint');
	const applyHint = el<HTMLElement>('prompt-apply-hint');

	function refreshPrompt(): void {
		if (promptPreview) promptPreview.textContent = buildPrompt(promptSource?.value ?? '');
	}

	function setHint(node: HTMLElement | null, text: string, level: 'ok' | 'bad' | ''): void {
		if (!node) return;
		node.textContent = text;
		if (level) node.dataset.level = level;
		else delete node.dataset.level;
	}

	el<HTMLButtonElement>('prompt-open')?.addEventListener('click', () => {
		refreshPrompt();
		promptModal?.showModal();
		promptSource?.focus();
	});
	el<HTMLButtonElement>('prompt-close')?.addEventListener('click', () => promptModal?.close());
	promptSource?.addEventListener('input', refreshPrompt);

	el<HTMLButtonElement>('prompt-copy')?.addEventListener('click', async () => {
		const text = buildPrompt(promptSource?.value ?? '');
		try {
			await navigator.clipboard.writeText(text);
			setHint(copyHint, T.promptCopied, 'ok');
		} catch {
			// Clipboard permission can be refused; selecting the text is the fallback.
			const box = promptPreview;
			if (box) {
				const range = document.createRange();
				range.selectNodeContents(box);
				const sel = window.getSelection();
				sel?.removeAllRanges();
				sel?.addRange(range);
			}
			setHint(copyHint, T.promptCopyBlocked, 'bad');
		}
	});

	el<HTMLButtonElement>('prompt-apply')?.addEventListener('click', () => {
		const cleaned = cleanLlmReply(promptResult?.value ?? '');
		const verdict = looksLikeCv(cleaned);
		if (!verdict.ok) {
			setHint(applyHint, verdict.reason ?? T.promptNotCv, 'bad');
			return;
		}
		// A new document, never an overwrite — the same rule the share-link
		// importer follows. Nothing already saved here is at risk.
		const incoming = parseResume(cleaned);
		const doc = makeDoc(incoming.profile.name.trim() || T.fromChatbot, cleaned);
		docs.push(doc);
		saveDocs(docs);
		loadDoc(doc.id);
		refreshDocList();
		promptModal?.close();
		if (shareBanner) {
			shareBanner.hidden = false;
			shareBanner.textContent = T.builtFromChatbot(doc.name);
		}
		setHint(applyHint, '', '');
		if (promptResult) promptResult.value = '';
	});

	// ── Cross-tab ────────────────────────────────────────────────────
	window.addEventListener('storage', (ev) => {
		if (ev.key !== STORAGE_KEYS.KEY_DOCS) return;
		docs = loadDocs();
		if (!docs.length) return;
		refreshDocList();
		const mine = docs.find((d) => d.id === activeId);
		// Only pull in the other tab's text when this one isn't mid-edit.
		const editing = formRoot!.contains(document.activeElement) || document.activeElement === mdInput;
		if (mine && mine.markdown !== markdown && !editing) loadDoc(activeId);
	});

	if (typeof ResizeObserver !== 'undefined') {
		new ResizeObserver(fitPreview).observe(preview);
	} else {
		window.addEventListener('resize', fitPreview);
	}

	/**
	 * A link produced by the QR (or the copy button) carries the whole CV. It
	 * lands as a *new* document so nothing already saved here is overwritten,
	 * and the parameter is stripped afterwards so a refresh doesn't re-import.
	 */
	async function importFromLink(): Promise<boolean> {
		const param = readShareParam(location);
		if (!param) return false;
		try {
			const md = await decodePayload(param);
			const incoming = parseResume(md);
			const doc = makeDoc(incoming.profile.name.trim() || T.sharedDoc, md);
			docs.push(doc);
			saveDocs(docs);
			loadDoc(doc.id);
			refreshDocList();
			if (shareBanner) {
				shareBanner.hidden = false;
				shareBanner.textContent = T.loadedFromLink(incoming.profile.name.trim() || T.aCv);
			}
		} catch {
			if (shareBanner) {
				shareBanner.hidden = false;
				shareBanner.textContent = T.linkUnreadable;
			}
			return false;
		} finally {
			const clean = `${location.origin}${location.pathname}`;
			history.replaceState(null, '', clean);
		}
		return true;
	}

	// ── First paint ──────────────────────────────────────────────────
	if (tips) tips.hidden = seen('printTips');
	mdInput.value = markdown;
	refreshDocList();
	syncToolbar();
	renderFormPane();
	void renderPreview();
	showTab('markdown');
	if (readShareParam(location)) void importFromLink();
	if (saveState) {
		saveState.textContent = T.saved;
		saveState.dataset.state = 'ok';
	}
}

export { TEMPLATES };
