// Markdown -> Resume.
//
// The contract is small on purpose: `##` opens a section, `###` opens an entry,
// the line under an entry is its dates, `- ` is a bullet, `**Label:** value` is
// a skills row. Anything unrecognised survives as prose under its section, so
// pasting a hand-written CV never silently drops text.

import {
	defaultSettings,
	type DensityId,
	type Entry,
	type PageId,
	type PhotoShape,
	type Resume,
	type Section,
	type SectionKind,
	type Settings,
	type TemplateId,
} from './types';

const TEMPLATE_IDS: TemplateId[] = ['ledger', 'broadsheet', 'rail', 'plain'];
const PAGE_IDS: PageId[] = ['A4', 'Letter'];
const DENSITY_IDS: DensityId[] = ['tight', 'normal', 'airy'];
const PHOTO_SHAPES: PhotoShape[] = ['circle', 'square'];

// One date token: "Jul 2025", "2020", or an open-ended marker. The ranges are
// anchored, so the Spanish markers have to be listed before their English
// prefixes — "Presente" would otherwise match only "Present" and fail on the $.
const TOK = String.raw`(?:[A-Za-z]{3,9}\.?\s+\d{4}|\d{4}|Presente|Present|Actualidad|Actual|Current|Now|Ongoing)`;
const RANGE = new RegExp(String.raw`^(${TOK})\s*(?:[–—−-]|\bto\b)\s*(${TOK})$`, 'i');
const SINGLE = new RegExp(String.raw`^(${TOK})$`, 'i');

/** Does this line read as an entry's date line? */
export function parseDates(line: string): { start: string; end: string } | null {
	const s = line.trim();
	const range = RANGE.exec(s);
	if (range) return { start: range[1].trim(), end: range[2].trim() };
	const single = SINGLE.exec(s);
	if (single) return { start: single[1].trim(), end: '' };
	return null;
}

const AT_SEP = /\s+@\s+/;
const DASH_SEP = /\s+(?:—|–|--)\s+/;

/** Split on the first match only, so separators inside `meta` survive. */
function splitOnce(s: string, re: RegExp): [string, string] {
	const m = re.exec(s);
	if (!m) return [s.trim(), ''];
	return [s.slice(0, m.index).trim(), s.slice(m.index + m[0].length).trim()];
}

/** `Role @ Org — Meta`, where `@` and `—` are both optional. */
export function parseEntryHead(raw: string): { role: string; org: string; meta: string } {
	const [before, after] = splitOnce(raw.trim(), AT_SEP);
	if (after) {
		const [org, meta] = splitOnce(after, DASH_SEP);
		return { role: before, org, meta };
	}
	const [role, meta] = splitOnce(before, DASH_SEP);
	return { role, org: '', meta };
}

function stripQuotes(v: string): string {
	const t = v.trim();
	if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
		return t.slice(1, -1);
	}
	return t;
}

type Front = Record<string, string | string[]>;

/** A deliberately small YAML subset: scalars, `- ` lists, and `[a, b]` inline lists. */
function parseFrontmatter(block: string): Front {
	const out: Front = {};
	let key: string | null = null;
	for (const raw of block.split('\n')) {
		if (!raw.trim() || raw.trim().startsWith('#')) continue;
		const item = /^\s*-\s+(.*)$/.exec(raw);
		if (item && key) {
			const list = out[key];
			if (Array.isArray(list)) list.push(stripQuotes(item[1]));
			continue;
		}
		const pair = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(raw);
		if (!pair) continue;
		key = pair[1];
		const value = pair[2].trim();
		if (!value) {
			out[key] = [];
		} else if (value.startsWith('[') && value.endsWith(']')) {
			out[key] = value
				.slice(1, -1)
				.split(',')
				.map(stripQuotes)
				.filter(Boolean);
		} else {
			out[key] = stripQuotes(value);
		}
	}
	return out;
}

function str(front: Front, key: string): string {
	const v = front[key];
	if (typeof v === 'string') return v;
	if (Array.isArray(v)) return v.join(' · ');
	return '';
}

function list(front: Front, key: string): string[] {
	const v = front[key];
	if (Array.isArray(v)) return v.filter(Boolean);
	if (typeof v === 'string' && v.trim()) return v.split(/\s*[,·|]\s*/).filter(Boolean);
	return [];
}

function bool(front: Front, key: string, fallback: boolean): boolean {
	const v = str(front, key).trim().toLowerCase();
	if (v === 'true' || v === 'yes') return true;
	if (v === 'false' || v === 'no') return false;
	return fallback;
}

function num(front: Front, key: string, fallback: number): number {
	const v = Number.parseFloat(str(front, key));
	return Number.isFinite(v) ? v : fallback;
}

function clamp(v: number, lo: number, hi: number): number {
	return Math.min(hi, Math.max(lo, v));
}

function oneOf<T extends string>(value: string, allowed: T[], fallback: T): T {
	const hit = allowed.find((a) => a.toLowerCase() === value.trim().toLowerCase());
	return hit ?? fallback;
}

function settingsFrom(front: Front): Settings {
	const base = defaultSettings();
	const accent = str(front, 'accent').trim();
	return {
		template: oneOf(str(front, 'template'), TEMPLATE_IDS, base.template),
		page: oneOf(str(front, 'page'), PAGE_IDS, base.page),
		density: oneOf(str(front, 'density'), DENSITY_IDS, base.density),
		accent: /^#[0-9a-f]{3,8}$/i.test(accent) ? accent : base.accent,
		photoShape: oneOf(str(front, 'photoShape'), PHOTO_SHAPES, base.photoShape),
		qr: bool(front, 'qr', base.qr),
		qrEvery: bool(front, 'qrEvery', base.qrEvery),
		qrSize: clamp(num(front, 'qrSize', base.qrSize), 30, 120),
		qrHash: bool(front, 'qrHash', base.qrHash),
		qrShort: str(front, 'qrShort').trim(),
		qrShortFor: str(front, 'qrShortFor').trim(),
		rail: list(front, 'rail'),
	};
}

/** Kind is inferred from what a section actually holds, so it round-trips. */
function inferKind(s: Section): SectionKind {
	if (s.entries.length) return 'entries';
	if (s.rows.length) return 'skills';
	if (s.items.length) return 'list';
	return 'text';
}

export function parseResume(markdown: string): Resume {
	const src = markdown.replace(/\r\n?/g, '\n');

	let front: Front = {};
	let body = src;
	const fm = /^---\n([\s\S]*?)\n---\n?/.exec(src);
	if (fm) {
		front = parseFrontmatter(fm[1]);
		body = src.slice(fm[0].length);
	}

	const sections: Section[] = [];
	let section: Section | null = null;
	let entry: Entry | null = null;
	// Prose lines waiting to be flushed into whatever container is open.
	let prose: string[] = [];

	const flushProse = () => {
		const text = prose.join('\n').replace(/\n{3,}/g, '\n\n').trim();
		prose = [];
		if (!text) return;
		if (entry) entry.summary = entry.summary ? `${entry.summary}\n\n${text}` : text;
		else if (section) section.text = section.text ? `${section.text}\n\n${text}` : text;
	};
	const closeEntry = () => {
		flushProse();
		if (entry && section) section.entries.push(entry);
		entry = null;
	};
	const closeSection = () => {
		closeEntry();
		if (section) {
			section.kind = inferKind(section);
			sections.push(section);
		}
		section = null;
	};

	const lines = body.split('\n');
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.trim();

		const h2 = /^##\s+(?!#)(.*)$/.exec(trimmed);
		if (h2) {
			closeSection();
			section = { heading: h2[1].trim(), kind: 'text', text: '', entries: [], rows: [], items: [] };
			continue;
		}

		const h3 = /^###\s+(.*)$/.exec(trimmed);
		if (h3) {
			if (!section) section = { heading: 'Experience', kind: 'entries', text: '', entries: [], rows: [], items: [] };
			closeEntry();
			const head = parseEntryHead(h3[1]);
			entry = { ...head, start: '', end: '', summary: '', bullets: [] };
			// A date line may follow immediately or after a blank line.
			for (let j = i + 1; j < lines.length; j++) {
				const peek = lines[j].trim();
				if (!peek) continue;
				const dates = parseDates(peek);
				if (dates) {
					entry.start = dates.start;
					entry.end = dates.end;
					i = j;
				}
				break;
			}
			continue;
		}

		if (!trimmed) {
			prose.push('');
			continue;
		}

		const bullet = /^[-*+]\s+(.*)$/.exec(trimmed);
		if (bullet) {
			flushProse();
			const parts = [bullet[1].trim()];
			// Absorb indented continuation lines so wrapped bullets stay one bullet.
			while (i + 1 < lines.length && /^\s{2,}\S/.test(lines[i + 1]) && !/^\s*[-*+]\s/.test(lines[i + 1])) {
				parts.push(lines[++i].trim());
			}
			const text = parts.join(' ');
			if (entry) entry.bullets.push(text);
			else if (section) section.items.push(text);
			continue;
		}

		// `**Label:** value` or `**Label**: value`. The colon is required so a
		// paragraph that merely opens in bold isn't mistaken for a skills row.
		const row = /^\*\*([^*]+?):\*\*\s*(.*)$/.exec(trimmed) ?? /^\*\*([^*]+?)\*\*:\s*(.*)$/.exec(trimmed);
		if (row && !entry && section) {
			flushProse();
			section.rows.push({ label: row[1].trim(), value: row[2].trim() });
			continue;
		}

		prose.push(trimmed);
	}
	closeSection();

	return {
		profile: {
			name: str(front, 'name'),
			title: str(front, 'title'),
			location: str(front, 'location'),
			email: str(front, 'email'),
			phone: str(front, 'phone'),
			links: list(front, 'links'),
			extra: str(front, 'extra'),
			// Only same-document data URIs; a remote URL would break the
			// "nothing leaves this tab" promise and wouldn't print reliably.
			photo: /^data:image\//i.test(str(front, 'photo').trim()) ? str(front, 'photo').trim() : '',
		},
		sections,
		settings: settingsFrom(front),
	};
}
