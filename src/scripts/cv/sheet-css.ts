// The paper. This exact string styles the on-screen preview *and* gets copied
// into the print iframe, so what you see is what the PDF contains — there is no
// second stylesheet that can drift.
//
// Everything here is print-first: sizes in pt and mm, ligatures and hyphenation
// off (they garble text extraction), and break rules that keep a job title
// attached to its employer.

export const SHEET_CSS = String.raw`
.sheet {
	--fs: 10.2pt;
	--lh: 1.42;
	--sec-gap: 11px;
	--entry-gap: 9px;
	--pad: 15mm;
	--photo: 24mm;
	--photo-rail: 30mm;
	--rail-w: 33%;
	--accent: #2f62c8;
	--ink: #16181d;
	--sub: #4b525c;
	--rule: #c8cdd6;
	--rail-bg: color-mix(in srgb, var(--accent) 10%, #fff);

	box-sizing: border-box;
	/* QR stamps are absolutely positioned against the sheet. */
	position: relative;
	background: #fff;
	color: var(--ink);
	font: 400 var(--fs) / var(--lh) Helvetica, Arial, "Helvetica Neue", sans-serif;
	padding: var(--pad);
	display: flex;
	flex-direction: column;
	gap: var(--sec-gap);
	/* Ligatures and soft hyphens are the two cheapest ways to corrupt the text a
	   parser pulls back out of the PDF. */
	font-variant-ligatures: none;
	hyphens: none;
	-webkit-print-color-adjust: exact;
	print-color-adjust: exact;
}
.sheet *,
.sheet *::before,
.sheet *::after { box-sizing: border-box; }

/* Isolation. The preview sits inside a dark site whose global stylesheet paints
   headings near-white and code in an accent colour; the print iframe loads none
   of that. Without these resets the paper would look one way on screen and
   another on paper — exactly the drift sharing this stylesheet is meant to
   prevent. Everything the sheet renders is styled here and nowhere else. */
.sheet p, .sheet ul, .sheet ol, .sheet dl, .sheet dd, .sheet dt,
.sheet h1, .sheet h2, .sheet h3, .sheet h4, .sheet h5, .sheet h6 { margin: 0; }
.sheet :is(h1, h2, h3, h4, h5, h6) { color: inherit; line-height: 1.15; }
.sheet a { color: inherit; text-decoration: none; }
.sheet strong, .sheet b { font-weight: 700; }
.sheet em, .sheet i { font-style: italic; }
.sheet code {
	background: none;
	border: 0;
	border-radius: 0;
	padding: 0;
	color: inherit;
	font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
	font-size: 0.93em;
}

/* Page geometry */
.sheet.p-A4 { width: 210mm; min-height: 297mm; }
.sheet.p-Letter { width: 8.5in; min-height: 11in; }

/* Density */
.sheet.d-tight { --fs: 9.4pt; --lh: 1.3; --sec-gap: 8px; --entry-gap: 6px; --pad: 12mm; --photo: 21mm; --photo-rail: 26mm; }
.sheet.d-normal { --fs: 10.2pt; --lh: 1.42; --sec-gap: 11px; --entry-gap: 9px; --pad: 15mm; --photo: 24mm; --photo-rail: 30mm; }
.sheet.d-airy { --fs: 11pt; --lh: 1.56; --sec-gap: 15px; --entry-gap: 13px; --pad: 18mm; --photo: 27mm; --photo-rail: 34mm; }

/* global.css caps images and rounds them; the print iframe never sees that
   file, so the sheet states its own image rules. */
.sheet img { max-width: none; border-radius: 0; display: block; }

/* ── QR stamp ─────────────────────────────────────────────────────── */
.cv-qr {
	position: absolute;
	right: 10mm;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1.5mm;
	/* Never let a stamp push the flow around or steal a page break. */
	break-inside: avoid;
}
.cv-qr svg { display: block; width: 100%; height: auto; }
.cv-qr-cap {
	font-size: 6.4pt;
	line-height: 1.25;
	letter-spacing: 0.02em;
	color: var(--sub);
	text-align: center;
	max-width: 100%;
}
.t-rail .cv-qr { right: 8mm; }
/* Reserved space under a stamp. Inserted by the app once the page geometry is
   known; carries no ink and nothing for a parser to read. */
.cv-keepout { flex: none; }

/* ── Masthead ─────────────────────────────────────────────────────── */
.cv-head { display: flex; flex-direction: column; gap: 3px; }
/* Text first in source order, portrait second — the picture must never come
   between the name and the contact line in the extracted text. */
.cv-head.has-photo { flex-direction: row; align-items: flex-start; justify-content: space-between; gap: 14px; }
.cv-head-text { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.cv-photo {
	width: var(--photo);
	height: var(--photo);
	flex: none;
	object-fit: cover;
	background: #eceff4;
}
.sheet.ph-circle .cv-photo { border-radius: 50%; }
.sheet.ph-square .cv-photo { border-radius: 3px; }
.cv-photo-rail { width: var(--photo-rail); height: var(--photo-rail); margin: 0 auto 2px; }
.cv-name { font-size: 2.05em; line-height: 1.1; font-weight: 700; letter-spacing: -0.01em; color: var(--ink); }
.cv-title { font-size: 1.05em; color: var(--sub); }
.cv-contact { font-size: 0.92em; color: var(--sub); }
.cv-extra { font-size: 0.86em; color: var(--sub); }
.cv-sep { padding: 0 0.16em; opacity: 0.55; }

/* ── Sections ─────────────────────────────────────────────────────── */
.cv-body { display: flex; flex-direction: column; gap: var(--sec-gap); }
.cv-sec { display: flex; flex-direction: column; gap: 6px; }
.cv-sec > h2 {
	font-size: 0.86em;
	font-weight: 700;
	/* Measured, not guessed: printing this sheet and running pdftotext over it
	   showed 0.11em makes the extractor insert a space between every glyph —
	   "PROFESSIONAL SUMMARY" comes back as "P R O F E S S I O N A L S U M M A RY",
	   which matches no section-name lookup anywhere. 0.06em extracted clean;
	   0.05em keeps a margin under that. */
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: var(--ink);
	break-after: avoid;
}
.cv-text { white-space: pre-line; }
.cv-text + .cv-text { margin-top: 0.5em; }

/* Skills rows: label and value stay on one line so the pairing survives
   extraction as "Languages: TypeScript, …" rather than two loose fragments. */
.cv-skills { display: flex; flex-direction: column; gap: 2px; }
.cv-skill { display: flex; gap: 0.45em; break-inside: avoid; }
.cv-skill dt { font-weight: 700; white-space: nowrap; }
.cv-skill dd { flex: 1; min-width: 0; }

.cv-items { padding-left: 1.15em; display: flex; flex-direction: column; gap: 2px; }
.cv-items li { break-inside: avoid; }

/* ── Entries ──────────────────────────────────────────────────────── */
.cv-entries { display: flex; flex-direction: column; gap: var(--entry-gap); }
.cv-entry { display: flex; flex-direction: column; gap: 3px; }
/* The title, employer and dates travel together; the bullets may flow onto the
   next page, which is normal and reads fine. */
.cv-entry-head { display: flex; flex-direction: column; gap: 1px; break-inside: avoid; break-after: avoid; }
.cv-entry-top { display: flex; justify-content: space-between; align-items: baseline; gap: 1.2em; }
.cv-entry-top h3 { font-size: 1.02em; font-weight: 700; color: var(--ink); }
.cv-dates {
	font-size: 0.88em;
	color: var(--sub);
	white-space: nowrap;
	font-variant-numeric: tabular-nums;
}
.cv-entry-sub { font-size: 0.92em; color: var(--sub); }
.cv-entry-summary { font-size: 0.97em; }
.cv-bullets { padding-left: 1.15em; display: flex; flex-direction: column; gap: 2px; }
.cv-bullets li { break-inside: avoid; }
.sheet ul { list-style: disc; }

/* ══ Ledger — the default. Sans, dates in a right-hand column. ═════ */
.t-ledger .cv-name { color: var(--accent); }
.t-ledger .cv-sec > h2 { border-bottom: 1.5px solid var(--ink); padding-bottom: 2px; }

/* ══ Broadsheet — serif, editorial, italic section heads. ══════════ */
.t-broadsheet { font-family: Georgia, "Iowan Old Style", "Times New Roman", Times, serif; }
.t-broadsheet .cv-name { font-weight: 400; font-size: 2.2em; letter-spacing: 0.005em; }
.t-broadsheet .cv-sec > h2 {
	font-size: 1.12em;
	font-weight: 400;
	font-style: italic;
	letter-spacing: 0;
	text-transform: none;
	color: var(--accent);
	border-bottom: 1px solid var(--rule);
	padding-bottom: 2px;
}
.t-broadsheet .cv-dates { font-style: italic; }

/* ══ Rail — tinted sidebar. The stripe is painted on the sheet itself
      rather than on the sidebar element, so it repeats correctly on every
      printed page instead of stopping at the end of page one. ════════ */
.sheet.t-rail {
	display: grid;
	grid-template-columns: var(--rail-w) 1fr;
	grid-template-rows: 1fr;
	gap: 0;
	padding: 0;
	background: linear-gradient(to right, var(--rail-bg) 0 var(--rail-w), #fff var(--rail-w) 100%);
}
.t-rail .cv-rail {
	padding: var(--pad) calc(var(--pad) * 0.6);
	display: flex;
	flex-direction: column;
	gap: var(--sec-gap);
	min-width: 0;
}
.t-rail .cv-main {
	padding: var(--pad) var(--pad) var(--pad) calc(var(--pad) * 0.7);
	display: flex;
	flex-direction: column;
	gap: var(--sec-gap);
	min-width: 0;
}
.t-rail .cv-name { font-size: 1.85em; color: var(--accent); }
.t-rail .cv-sec > h2 { color: color-mix(in srgb, var(--accent) 80%, #000); }
.t-rail .cv-rail .cv-sec > h2 { border-bottom: 1px solid color-mix(in srgb, var(--accent) 28%, #fff); padding-bottom: 2px; }
.t-rail .cv-main .cv-sec > h2 { border-bottom: 1.5px solid var(--accent); padding-bottom: 2px; }
/* Stacked, not side-by-side: the sidebar column is too narrow for a split row. */
.t-rail .cv-rail .cv-skill { flex-direction: column; gap: 0; }
.t-rail .cv-rail .cv-entry-top { flex-direction: column; align-items: flex-start; gap: 0; }
.t-rail .cv-rail .cv-contact,
.t-rail .cv-rail .cv-extra { font-size: 0.92em; }
.t-rail .cv-rail .cv-contact-list { display: flex; flex-direction: column; gap: 2px; }
.t-rail .cv-photo-rail { box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 35%, #fff); }

/* ══ Plain — nothing but hierarchy, for the portals that eat everything
      else. Colour is dropped entirely, on purpose. ══════════════════ */
.t-plain { font-family: "Times New Roman", Times, Georgia, serif; --accent: #000; }
.t-plain .cv-name { color: #000; font-size: 1.9em; }
.t-plain .cv-sec > h2 { letter-spacing: 0.04em; }
.t-plain .cv-entry-top { display: block; }
.t-plain .cv-dates { display: block; white-space: normal; }
`;

/** Extra rules that only make sense inside the print iframe. */
export function printCss(page: string): string {
	return String.raw`
@page { size: ${page}; margin: 0; }
html, body { margin: 0; padding: 0; background: #fff; }
.sheet { margin: 0; box-shadow: none; border: 0; }
`;
}
