// Resume -> sheet markup.
//
// One structure, four skins. Ledger, Broadsheet and Plain emit byte-identical
// DOM and differ only in CSS; Rail is the one template that genuinely changes
// the skeleton, and even there the DOM order is the reading order — sidebar
// first, then the main column — so the text extracts as two contiguous blocks.

import type { Entry, Profile, Resume, Section } from './types';
import { s } from './i18n';

function esc(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function href(raw: string): string {
	const v = raw.trim();
	if (/^(https?:|mailto:|tel:)/i.test(v)) return v;
	if (v.includes('@') && !v.includes('/')) return `mailto:${v}`;
	return `https://${v}`;
}

const EMAIL = /\b[\w.+-]+@[\w-]+\.[\w.-]*[\w-]\b/g;
// Bare URLs and bare domains. The TLD list is deliberately short so that
// "Next.js" and "Node.js" stay plain text instead of turning into links.
const URLISH =
	/\b(?:https?:\/\/[^\s<>()]+|(?:www\.|(?:[a-z0-9-]+\.)+(?:com|org|net|io|dev|app|ai|co|me|sh|xyz|gg|edu|gov))(?:\/[^\s<>()]*)?)/gi;

/**
 * Inline markdown: links, code, bold, italic. Explicit links and anything
 * URL-shaped get parked behind placeholders first, so later passes can't chew
 * on markup that has already been generated.
 */
export function inline(raw: string): string {
	const parked: string[] = [];
	// The fence must be a character a textarea cannot produce: a bare index
	// would collide with every "3+ years" in the document.
	const park = (html: string): string => `\u0001${parked.push(html) - 1}\u0001`;

	let s = esc(raw);
	s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, url: string) =>
		park(`<a href="${esc(href(url))}">${text}</a>`),
	);
	s = s.replace(EMAIL, (m) => park(`<a href="mailto:${esc(m)}">${m}</a>`));
	s = s.replace(URLISH, (m) => park(`<a href="${esc(href(m))}">${m}</a>`));
	s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
	s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
	s = s.replace(/\u0001(\d+)\u0001/g, (_m, i: string) => parked[Number(i)] ?? '');
	return s;
}

function paragraphs(text: string, cls = 'cv-text'): string {
	return text
		.split(/\n{2,}/)
		.map((p) => p.trim())
		.filter(Boolean)
		.map((p) => `<p class="${cls}">${inline(p)}</p>`)
		.join('');
}

function contactBits(p: Profile): string[] {
	const bits: string[] = [];
	if (p.location.trim()) bits.push(esc(p.location.trim()));
	if (p.email.trim()) bits.push(inline(p.email.trim()));
	if (p.phone.trim()) bits.push(esc(p.phone.trim()));
	for (const l of p.links) if (l.trim()) bits.push(inline(l.trim()));
	return bits;
}

function renderEntry(e: Entry): string {
	const dates = [e.start.trim(), e.end.trim()].filter(Boolean).join(' – ');
	const sub = [e.org.trim(), e.meta.trim()].filter(Boolean).join(' · ');
	const bullets = e.bullets.filter((b) => b.trim());

	const head =
		`<div class="cv-entry-head">` +
		`<div class="cv-entry-top">` +
		`<h3>${inline(e.role)}</h3>` +
		(dates ? `<span class="cv-dates">${esc(dates)}</span>` : '') +
		`</div>` +
		(sub ? `<p class="cv-entry-sub">${inline(sub)}</p>` : '') +
		`</div>`;

	return (
		`<div class="cv-entry">` +
		head +
		(e.summary.trim() ? paragraphs(e.summary, 'cv-entry-summary') : '') +
		(bullets.length ? `<ul class="cv-bullets">${bullets.map((b) => `<li>${inline(b)}</li>`).join('')}</ul>` : '') +
		`</div>`
	);
}

function renderSection(s: Section): string {
	const parts: string[] = [];
	if (s.heading.trim()) parts.push(`<h2>${esc(s.heading.trim())}</h2>`);
	if (s.text.trim()) parts.push(paragraphs(s.text));

	if (s.kind === 'skills') {
		const rows = s.rows.filter((r) => r.label.trim() || r.value.trim());
		if (rows.length) {
			parts.push(
				`<dl class="cv-skills">` +
					rows
						.map(
							(r) =>
								`<div class="cv-skill"><dt>${esc(r.label.trim())}${r.label.trim() ? ':' : ''}</dt><dd>${inline(r.value)}</dd></div>`,
						)
						.join('') +
					`</dl>`,
			);
		}
	} else if (s.kind === 'list') {
		const items = s.items.filter((i) => i.trim());
		if (items.length) {
			parts.push(`<ul class="cv-items">${items.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>`);
		}
	} else if (s.kind === 'entries') {
		const entries = s.entries.filter((e) => e.role.trim() || e.org.trim() || e.bullets.some((b) => b.trim()));
		if (entries.length) {
			parts.push(`<div class="cv-entries">${entries.map(renderEntry).join('')}</div>`);
		}
	}

	if (parts.length <= (s.heading.trim() ? 1 : 0)) return '';
	return `<section class="cv-sec">${parts.join('')}</section>`;
}

/**
 * The portrait. Always emitted *after* the text in source order and with an
 * empty alt, so it contributes nothing to what a parser extracts.
 */
function photo(p: Profile, cls: string): string {
	if (!p.photo) return '';
	return `<img class="${cls}" src="${esc(p.photo)}" alt="" />`;
}

function masthead(p: Profile, withContact: boolean, withPhoto: boolean): string {
	const bits = withContact ? contactBits(p) : [];
	const text =
		(p.name.trim() ? `<h1 class="cv-name">${esc(p.name.trim())}</h1>` : '') +
		(p.title.trim() ? `<p class="cv-title">${inline(p.title)}</p>` : '') +
		// Real spaces around the separator, not just padding — otherwise the
		// contact line extracts as "Buenos Aires·you@example.com·github.com/you".
		(bits.length ? `<p class="cv-contact">${bits.join(' <span class="cv-sep">·</span> ')}</p>` : '') +
		(withContact && p.extra.trim() ? `<p class="cv-extra">${inline(p.extra)}</p>` : '');

	const img = withPhoto ? photo(p, 'cv-photo') : '';
	if (!img) return `<header class="cv-head">${text}</header>`;
	return `<header class="cv-head has-photo"><div class="cv-head-text">${text}</div>${img}</header>`;
}

function railContact(p: Profile): string {
	const bits = contactBits(p);
	if (!bits.length && !p.extra.trim()) return '';
	return (
		photo(p, 'cv-photo cv-photo-rail') +
		`<section class="cv-sec">` +
		`<h2>${esc(s().render.contact)}</h2>` +
		(bits.length ? `<div class="cv-contact cv-contact-list">${bits.map((b) => `<div>${b}</div>`).join('')}</div>` : '') +
		(p.extra.trim() ? `<p class="cv-extra">${inline(p.extra)}</p>` : '') +
		`</section>`
	);
}

/**
 * QR stamps, positioned by the caller. The SVG is built in app.ts because
 * encoding the payload is asynchronous (it goes through CompressionStream) and
 * this function has to stay pure and synchronous.
 */
export type SheetExtras = {
	qr?: {
		svg: string;
		/** One offset per stamp, in layout px from the top of the sheet. */
		tops: number[];
		sizePx: number;
		caption: string;
	};
};

function renderQr(extras: SheetExtras): string {
	const qr = extras.qr;
	if (!qr || !qr.tops.length) return '';
	return qr.tops
		.map(
			(top) =>
				`<div class="cv-qr" style="top:${Math.round(top)}px;width:${Math.round(qr.sizePx)}px">` +
				qr.svg +
				(qr.caption ? `<span class="cv-qr-cap">${esc(qr.caption)}</span>` : '') +
				`</div>`,
		)
		.join('');
}

/** Returns the full `<article class="sheet …">` element as a string. */
export function renderSheet(r: Resume, extras: SheetExtras = {}): string {
	const { settings: st } = r;
	// Plain exists to be maximally parseable and unadorned, so it drops the
	// portrait on purpose; the linter says so rather than silently ignoring it.
	const withPhoto = st.template !== 'plain' && !!r.profile.photo;
	const cls = `sheet t-${st.template} p-${st.page} d-${st.density} ph-${st.photoShape}`;
	const style = ` style="--accent:${esc(st.accent)}"`;

	if (st.template === 'rail') {
		const pinned = new Set(st.rail.map((h) => h.trim().toLowerCase()).filter(Boolean));
		const inRail = r.sections.filter((s) => pinned.has(s.heading.trim().toLowerCase()));
		const inMain = r.sections.filter((s) => !pinned.has(s.heading.trim().toLowerCase()));
		return (
			`<article class="${cls}"${style}>` +
			`<div class="cv-rail">${withPhoto ? railContact(r.profile) : railContact({ ...r.profile, photo: '' })}${inRail.map(renderSection).join('')}</div>` +
			`<div class="cv-main">${masthead(r.profile, false, false)}<div class="cv-body">${inMain.map(renderSection).join('')}</div></div>` +
			renderQr(extras) +
			`</article>`
		);
	}

	return (
		`<article class="${cls}"${style}>` +
		masthead(r.profile, true, withPhoto) +
		`<div class="cv-body">${r.sections.map(renderSection).join('')}</div>` +
		renderQr(extras) +
		`</article>`
	);
}
