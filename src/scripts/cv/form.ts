// The form editor.
//
// Fields write straight into the model through a `data-p` path, so typing never
// re-renders the form (which would steal focus mid-word) — it only re-renders
// the paper. Structural edits (add, delete, reorder, change a section's kind)
// do rebuild the form, and hand back the path of the field that should take
// focus afterwards so the cursor lands where you'd expect.

import { s as strings } from './i18n';
import { emptyEntry, emptySection, type Resume, type Section, type SectionKind } from './types';

const KINDS = (): { id: SectionKind; label: string }[] => [
	{ id: 'entries', label: strings().form.kinds.entries },
	{ id: 'text', label: strings().form.kinds.text },
	{ id: 'skills', label: strings().form.kinds.skills },
	{ id: 'list', label: strings().form.kinds.list },
];

function esc(s: string): string {
	return String(s)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** Writes `value` into `r` at a dotted path like `sections.2.entries.0.role`. */
export function setPath(r: Resume, path: string, value: string): void {
	const parts = path.split('.');
	let obj: Record<string, unknown> = r as unknown as Record<string, unknown>;
	for (let i = 0; i < parts.length - 1; i++) {
		const next = obj[parts[i]];
		if (next === null || typeof next !== 'object') return;
		obj = next as Record<string, unknown>;
	}
	obj[parts[parts.length - 1]] = value;
}

function field(label: string, path: string, value: string, opts: { placeholder?: string; wide?: boolean; type?: string } = {}): string {
	return (
		`<label class="fm-f${opts.wide ? ' fm-wide' : ''}">` +
		`<span>${esc(label)}</span>` +
		`<input type="${opts.type ?? 'text'}" data-p="${esc(path)}" value="${esc(value)}"` +
		(opts.placeholder ? ` placeholder="${esc(opts.placeholder)}"` : '') +
		`>` +
		`</label>`
	);
}

function area(label: string, path: string, value: string, placeholder = ''): string {
	return (
		`<label class="fm-f fm-wide">` +
		`<span>${esc(label)}</span>` +
		`<textarea data-p="${esc(path)}" rows="2"${placeholder ? ` placeholder="${esc(placeholder)}"` : ''}>${esc(value)}</textarea>` +
		`</label>`
	);
}

function iconBtn(act: string, glyph: string, title: string, data: Record<string, number> = {}): string {
	const attrs = Object.entries(data)
		.map(([k, v]) => ` data-${k}="${v}"`)
		.join('');
	return `<button type="button" class="fm-icon" data-act="${act}"${attrs} title="${esc(title)}" aria-label="${esc(title)}">${glyph}</button>`;
}

function renderEntry(s: number, e: number, entry: Resume['sections'][number]['entries'][number], total: number): string {
	const t = strings().form;
	const base = `sections.${s}.entries.${e}`;
	const bullets = entry.bullets.length ? entry.bullets : [''];
	return (
		`<div class="fm-entry">` +
		`<div class="fm-entry-bar">` +
		`<span class="fm-lbl">${esc(t.entryOf(e + 1, total))}</span>` +
		`<span class="fm-tools">` +
		iconBtn('entry-up', '↑', t.moveUp, { s, e }) +
		iconBtn('entry-down', '↓', t.moveDown, { s, e }) +
		iconBtn('del-entry', '✕', t.removeEntry, { s, e }) +
		`</span>` +
		`</div>` +
		`<div class="fm-grid">` +
		field(t.f.title, `${base}.role`, entry.role, { placeholder: t.ph.role }) +
		field(t.f.org, `${base}.org`, entry.org, { placeholder: t.ph.org }) +
		field(t.f.from, `${base}.start`, entry.start, { placeholder: t.ph.start }) +
		field(t.f.to, `${base}.end`, entry.end, { placeholder: t.ph.end }) +
		field(t.f.meta, `${base}.meta`, entry.meta, { placeholder: t.ph.meta, wide: true }) +
		`</div>` +
		area(t.f.lead, `${base}.summary`, entry.summary, t.ph.lead) +
		`<div class="fm-rep">` +
		`<span class="fm-lbl">${esc(t.bullets)}</span>` +
		bullets
			.map(
				(b, i) =>
					`<div class="fm-row">` +
					`<textarea data-p="${base}.bullets.${i}" rows="2" placeholder="${esc(t.ph.bullet)}">${esc(b)}</textarea>` +
					iconBtn('del-bullet', '✕', t.removeBullet, { s, e, i }) +
					`</div>`,
			)
			.join('') +
		`<button type="button" class="fm-add" data-act="add-bullet" data-s="${s}" data-e="${e}">${esc(t.addBullet)}</button>` +
		`</div>` +
		`</div>`
	);
}

function renderSectionBody(i: number, s: Section): string {
	const t = strings().form;
	if (s.kind === 'text') {
		return area(t.f.text, `sections.${i}.text`, s.text, t.ph.text);
	}

	if (s.kind === 'skills') {
		const rows = s.rows.length ? s.rows : [{ label: '', value: '' }];
		return (
			`<div class="fm-rep">` +
			rows
				.map(
					(r, j) =>
						`<div class="fm-row fm-row-pair">` +
						`<input type="text" data-p="sections.${i}.rows.${j}.label" value="${esc(r.label)}" placeholder="${esc(t.ph.skillKey)}" class="fm-key">` +
						`<input type="text" data-p="sections.${i}.rows.${j}.value" value="${esc(r.value)}" placeholder="${esc(t.ph.skillValue)}">` +
						iconBtn('del-row', '✕', t.removeRow, { s: i, i: j }) +
						`</div>`,
				)
				.join('') +
			`<button type="button" class="fm-add" data-act="add-row" data-s="${i}">${esc(t.addRow)}</button>` +
			`</div>`
		);
	}

	if (s.kind === 'list') {
		const items = s.items.length ? s.items : [''];
		return (
			`<div class="fm-rep">` +
			items
				.map(
					(it, j) =>
						`<div class="fm-row">` +
						`<input type="text" data-p="sections.${i}.items.${j}" value="${esc(it)}" placeholder="${esc(t.ph.item)}">` +
						iconBtn('del-item', '✕', t.removeItem, { s: i, i: j }) +
						`</div>`,
				)
				.join('') +
			`<button type="button" class="fm-add" data-act="add-item" data-s="${i}">${esc(t.addItem)}</button>` +
			`</div>`
		);
	}

	const entries = s.entries.length ? s.entries : [emptyEntry()];
	return (
		`<div class="fm-entries">` +
		entries.map((e, j) => renderEntry(i, j, e, entries.length)).join('') +
		`<button type="button" class="fm-add" data-act="add-entry" data-s="${i}">${esc(t.addEntry)}</button>` +
		`</div>`
	);
}

/**
 * Portrait picker. Whether a CV should carry a photo at all is regional, not
 * technical — normal across Latin America and much of Europe, actively
 * discouraged in the US, UK and Canada — so the control states that plainly
 * instead of the tool deciding for you.
 */
function photoControl(r: Resume): string {
	const { photo } = r.profile;
	const shape = r.settings.photoShape;
	const plain = r.settings.template === 'plain';
	const t = strings().form;
	return (
		`<div class="fm-photo">` +
		`<span class="fm-lbl">${esc(t.photo.label)}</span>` +
		`<div class="fm-photo-row">` +
		(photo
			? `<img class="fm-photo-thumb is-${shape}" src="${esc(photo)}" alt="${esc(t.photo.alt)}">`
			: `<span class="fm-photo-thumb is-empty is-${shape}" aria-hidden="true"></span>`) +
		`<div class="fm-photo-actions">` +
		`<button type="button" data-act="photo-pick">${esc(photo ? t.photo.replace : t.photo.add)}</button>` +
		(photo ? `<button type="button" data-act="photo-remove">${esc(t.photo.remove)}</button>` : '') +
		`<select data-act="photo-shape" aria-label="${esc(t.photo.shape)}">` +
		`<option value="circle"${shape === 'circle' ? ' selected' : ''}>${esc(t.photo.circle)}</option>` +
		`<option value="square"${shape === 'square' ? ' selected' : ''}>${esc(t.photo.square)}</option>` +
		`</select>` +
		`</div>` +
		`</div>` +
		`<p class="fm-hint">` +
		(plain && photo ? esc(t.photo.plainNote) : '') +
		esc(t.photo.hint) +
		`</p>` +
		`<input type="file" accept="image/*" data-photo-input hidden>` +
		`</div>`
	);
}

export function renderForm(r: Resume): string {
	const t = strings().form;
	const p = r.profile;
	const railOn = r.settings.template === 'rail';
	const pinned = new Set(r.settings.rail.map((h) => h.trim().toLowerCase()));
	const links = p.links.length ? p.links : [''];

	const profile =
		`<section class="fm-card">` +
		`<h3 class="fm-card-title">${esc(t.whoYouAre)}</h3>` +
		`<div class="fm-grid">` +
		field(t.f.name, 'profile.name', p.name, { placeholder: t.ph.name }) +
		field(t.f.headline, 'profile.title', p.title, { placeholder: t.ph.headline }) +
		field(t.f.email, 'profile.email', p.email, { placeholder: t.ph.email, type: 'email' }) +
		field(t.f.phone, 'profile.phone', p.phone, { placeholder: t.ph.phone }) +
		field(t.f.location, 'profile.location', p.location, { placeholder: t.ph.location, wide: true }) +
		`</div>` +
		`<div class="fm-rep">` +
		`<span class="fm-lbl">${esc(t.links)}</span>` +
		links
			.map(
				(l, i) =>
					`<div class="fm-row">` +
					`<input type="text" data-p="profile.links.${i}" value="${esc(l)}" placeholder="${esc(t.ph.link)}">` +
					iconBtn('del-link', '✕', t.removeLink, { i }) +
					`</div>`,
			)
			.join('') +
		`<button type="button" class="fm-add" data-act="add-link">${esc(t.addLink)}</button>` +
		`</div>` +
		area(t.f.extra, 'profile.extra', p.extra, t.ph.extra) +
		photoControl(r) +
		`</section>`;

	const sections = r.sections
		.map((s, i) => {
			const isPinned = pinned.has(s.heading.trim().toLowerCase());
			return (
				`<section class="fm-card fm-section" data-s="${i}">` +
				`<div class="fm-head">` +
				`<input type="text" class="fm-heading" data-p="sections.${i}.heading" value="${esc(s.heading)}" aria-label="${esc(t.sectionHeading)}">` +
				`<span class="fm-tools">` +
				iconBtn('up', '↑', t.moveSectionUp, { i }) +
				iconBtn('down', '↓', t.moveSectionDown, { i }) +
				iconBtn('del-section', '✕', t.deleteSection, { i }) +
				`</span>` +
				`</div>` +
				`<div class="fm-opts">` +
				`<label class="fm-kind"><span class="sr-only">${esc(t.sectionType)}</span>` +
				`<select data-act="kind" data-i="${i}">` +
				KINDS().map((k) => `<option value="${k.id}"${k.id === s.kind ? ' selected' : ''}>${esc(k.label)}</option>`).join('') +
				`</select></label>` +
				(railOn
					? `<label class="fm-check"><input type="checkbox" data-act="rail" data-i="${i}"${isPinned ? ' checked' : ''}> ${esc(t.inSidebar)}</label>`
					: '') +
				`</div>` +
				renderSectionBody(i, s) +
				`</section>`
			);
		})
		.join('');

	return (
		`<div class="fm">` +
		profile +
		sections +
		`<button type="button" class="fm-add fm-add-section" data-act="add-section">${esc(t.addSection)}</button>` +
		`</div>`
	);
}

export type ActionResult = { structural: boolean; focus?: string } | null;

function move<T>(arr: T[], from: number, to: number): void {
	if (to < 0 || to >= arr.length) return;
	const [item] = arr.splice(from, 1);
	arr.splice(to, 0, item);
}

/** Applies a structural button/select action to the model. */
export function applyAction(r: Resume, act: string, d: DOMStringMap): ActionResult {
	const i = Number(d.i ?? -1);
	const si = Number(d.s ?? -1);
	const ei = Number(d.e ?? -1);
	const section = r.sections[si];

	switch (act) {
		case 'add-link':
			r.profile.links.push('');
			return { structural: true, focus: `profile.links.${r.profile.links.length - 1}` };
		case 'del-link':
			r.profile.links.splice(i, 1);
			return { structural: true };

		case 'add-section': {
			r.sections.push(emptySection('entries'));
			return { structural: true, focus: `sections.${r.sections.length - 1}.heading` };
		}
		case 'del-section': {
			const gone = r.sections[i];
			if (gone) {
				r.settings.rail = r.settings.rail.filter((h) => h.trim().toLowerCase() !== gone.heading.trim().toLowerCase());
			}
			r.sections.splice(i, 1);
			return { structural: true };
		}
		case 'up':
			move(r.sections, i, i - 1);
			return { structural: true };
		case 'down':
			move(r.sections, i, i + 1);
			return { structural: true };

		case 'add-entry':
			if (!section) return null;
			section.entries.push(emptyEntry());
			return { structural: true, focus: `sections.${si}.entries.${section.entries.length - 1}.role` };
		case 'del-entry':
			if (!section) return null;
			section.entries.splice(ei, 1);
			return { structural: true };
		case 'entry-up':
			if (!section) return null;
			move(section.entries, ei, ei - 1);
			return { structural: true };
		case 'entry-down':
			if (!section) return null;
			move(section.entries, ei, ei + 1);
			return { structural: true };

		case 'add-bullet': {
			const entry = section?.entries[ei];
			if (!entry) return null;
			entry.bullets.push('');
			return { structural: true, focus: `sections.${si}.entries.${ei}.bullets.${entry.bullets.length - 1}` };
		}
		case 'del-bullet': {
			const entry = section?.entries[ei];
			if (!entry) return null;
			entry.bullets.splice(i, 1);
			return { structural: true };
		}

		case 'add-row':
			if (!section) return null;
			section.rows.push({ label: '', value: '' });
			return { structural: true, focus: `sections.${si}.rows.${section.rows.length - 1}.label` };
		case 'del-row':
			if (!section) return null;
			section.rows.splice(i, 1);
			return { structural: true };

		case 'add-item':
			if (!section) return null;
			section.items.push('');
			return { structural: true, focus: `sections.${si}.items.${section.items.length - 1}` };
		case 'del-item':
			if (!section) return null;
			section.items.splice(i, 1);
			return { structural: true };

		default:
			return null;
	}
}

/** Section kind changed. Nothing is discarded — the other buckets just go quiet. */
export function applyKind(r: Resume, index: number, kind: SectionKind): ActionResult {
	const s = r.sections[index];
	if (!s) return null;
	s.kind = kind;
	if (kind === 'entries' && !s.entries.length) s.entries.push(emptyEntry());
	if (kind === 'skills' && !s.rows.length) s.rows.push({ label: '', value: '' });
	if (kind === 'list' && !s.items.length) s.items.push('');
	return { structural: true };
}

/** Sidebar checkbox on a section (Rail template only). */
export function applyRail(r: Resume, index: number, on: boolean): ActionResult {
	const s = r.sections[index];
	if (!s) return null;
	const key = s.heading.trim();
	const rest = r.settings.rail.filter((h) => h.trim().toLowerCase() !== key.toLowerCase());
	r.settings.rail = on ? [...rest, key] : rest;
	return { structural: false };
}

/** Textareas grow with their content so long bullets stay readable. */
export function autosize(el: HTMLTextAreaElement): void {
	el.style.height = 'auto';
	el.style.height = `${el.scrollHeight}px`;
}

export function autosizeAll(root: ParentNode): void {
	for (const el of Array.from(root.querySelectorAll('textarea'))) autosize(el as HTMLTextAreaElement);
}
