// The résumé model. Everything downstream — the four templates, the linter and
// the ATS text preview — is a pure function of this object. Nothing in here
// touches the DOM, so it can be reasoned about (and tested) on its own.

import { s } from './i18n';

/** One job, degree, or project. The same shape covers all three. */
export type Entry = {
	/** Job title, degree name, or project name. */
	role: string;
	/** Employer, institution, or the project's stack. */
	org: string;
	/** Everything else on the sub-line: location, arrangement, a repo URL. */
	meta: string;
	start: string;
	end: string;
	/** Optional prose line between the dates and the bullets. */
	summary: string;
	bullets: string[];
};

/** A `**Label:** value` row, used by skills-style sections. */
export type SkillRow = { label: string; value: string };

export type SectionKind = 'text' | 'entries' | 'skills' | 'list';

/**
 * One `##` section. Every kind-specific field lives on the same object rather
 * than in a discriminated union: the form editor lets you switch a section's
 * kind, and keeping all four buckets means switching never destroys what you
 * already typed.
 */
export type Section = {
	heading: string;
	kind: SectionKind;
	/** Lead prose. Rendered above entries when a section has both. */
	text: string;
	entries: Entry[];
	rows: SkillRow[];
	items: string[];
};

export type Profile = {
	name: string;
	title: string;
	location: string;
	email: string;
	phone: string;
	links: string[];
	/** Free line under the contacts — languages, work authorisation, etc. */
	extra: string;
	/** Square JPEG data URI, or '' for none. Travels inside the markdown so
	 *  export/import stays self-contained. */
	photo: string;
};

export type TemplateId = 'ledger' | 'broadsheet' | 'rail' | 'plain';
export type PageId = 'A4' | 'Letter';
export type PhotoShape = 'circle' | 'square';
export type DensityId = 'tight' | 'normal' | 'airy';

export type Settings = {
	template: TemplateId;
	page: PageId;
	density: DensityId;
	accent: string;
	photoShape: PhotoShape;
	/** Stamp the printed page with a code carrying the whole CV. */
	qr: boolean;
	/** Stamp it on every page rather than only the last. */
	qrEvery: boolean;
	/** Printed edge length in millimetres. */
	qrSize: number;
	/** Put the payload in the fragment instead of the query string, so it never
	 *  reaches a server log. */
	qrHash: boolean;
	/** A TinyURL standing in for the self-contained link, once created. */
	qrShort: string;
	/** Digest of the payload `qrShort` was made from, so edits can invalidate it. */
	qrShortFor: string;
	/**
	 * Headings pinned to the sidebar in the Rail template. Explicit rather than
	 * inferred: guessing which sections are "short enough" for a sidebar was
	 * wrong often enough to be worth one line of frontmatter.
	 */
	rail: string[];
};

export type Resume = {
	profile: Profile;
	sections: Section[];
	settings: Settings;
};

/**
 * The templates and how well each one survives a parser. Their names are
 * product names and stay put in every language; the one-line descriptions are
 * copy, and live with the rest of the page's copy in `src/i18n/cv-page.ts`.
 */
export const TEMPLATES: { id: TemplateId; risk: 'none' | 'low' | 'moderate' }[] = [
	{ id: 'ledger', risk: 'low' },
	{ id: 'broadsheet', risk: 'low' },
	{ id: 'rail', risk: 'moderate' },
	{ id: 'plain', risk: 'none' },
];

export function emptyEntry(): Entry {
	return { role: '', org: '', meta: '', start: '', end: '', summary: '', bullets: [''] };
}

export function emptySection(kind: SectionKind = 'entries'): Section {
	return {
		heading: s().form.newSection,
		kind,
		text: '',
		entries: kind === 'entries' ? [emptyEntry()] : [],
		rows: kind === 'skills' ? [{ label: '', value: '' }] : [],
		items: kind === 'list' ? [''] : [],
	};
}

export function defaultSettings(): Settings {
	return {
		template: 'ledger',
		page: 'A4',
		density: 'normal',
		accent: '#2f62c8',
		photoShape: 'circle',
		qr: false,
		qrEvery: false,
		qrSize: 58,
		qrHash: false,
		qrShort: '',
		qrShortFor: '',
		rail: [],
	};
}

export function emptyResume(): Resume {
	return {
		profile: { name: '', title: '', location: '', email: '', phone: '', links: [], extra: '', photo: '' },
		sections: [],
		settings: defaultSettings(),
	};
}
