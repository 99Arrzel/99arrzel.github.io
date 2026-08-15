// Checks that run against the model, not the pixels.
//
// The point isn't to score you. It's to surface the handful of failures that
// are invisible in the preview but obvious to a parser: no email in the body,
// a date range that didn't parse, a section heading nothing will recognise.

import { wordCount } from './extract';
import { s } from './i18n';
import type { Resume } from './types';

export type Level = 'error' | 'warn' | 'info';
export type Diagnostic = { level: Level; message: string; hint?: string };

/**
 * Headings ATS field-mapping actually recognises.
 *
 * Both languages are listed unconditionally, not switched on the page's locale:
 * which set is right depends on the market someone is applying into, not on the
 * language they happen to be reading this tool in. A Spanish CV opened in the
 * English UI should not light up with warnings.
 */
const CANONICAL = [
	'summary', 'professional summary', 'profile', 'about', 'objective',
	'experience', 'work experience', 'professional experience', 'employment', 'employment history',
	'education', 'skills', 'technical skills', 'core skills',
	'projects', 'personal projects', 'certifications', 'certificates', 'licenses',
	'publications', 'awards', 'languages', 'volunteering', 'interests', 'contact', 'references',
	// Spanish equivalents, with and without the accents people drop in practice.
	'resumen', 'resumen profesional', 'perfil', 'perfil profesional', 'acerca de mí', 'acerca de mi', 'objetivo',
	'experiencia', 'experiencia laboral', 'experiencia profesional', 'empleo', 'historial laboral',
	'educación', 'educacion', 'formación', 'formacion', 'formación académica', 'formacion academica',
	'habilidades', 'habilidades técnicas', 'habilidades tecnicas', 'competencias', 'conocimientos',
	'proyectos', 'proyectos personales', 'certificaciones', 'certificados', 'licencias',
	'publicaciones', 'premios', 'idiomas', 'voluntariado', 'intereses', 'contacto', 'referencias',
];

const LONG_BULLET = 34;
const LONG_SUMMARY = 130;

export type LintContext = {
	pages: number;
	extracted: string;
	interleaved: boolean;
	/** Printed millimetres per QR module, or null when no code is on the page. */
	qrDensity: number | null;
	/** True when a short link exists but no longer matches the current CV. */
	qrStale: boolean;
};

export function lint(r: Resume, ctx: LintContext): Diagnostic[] {
	const t = s().lint;
	const out: Diagnostic[] = [];
	const add = (level: Level, message: string, hint?: string) => out.push({ level, message, hint });

	// ── Contact ──────────────────────────────────────────────────────
	if (!r.profile.name.trim()) {
		add('error', t.noName, t.noNameHint);
	}
	if (!r.profile.email.trim()) {
		add('error', t.noEmail, t.noEmailHint);
	} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.profile.email.trim())) {
		add('warn', t.badEmail(r.profile.email.trim()));
	}
	if (!r.profile.links.some((l) => l.trim())) {
		add('info', t.noLinks, t.noLinksHint);
	}
	if (!r.profile.location.trim()) {
		add('info', t.noLocation, t.noLocationHint);
	}
	if (r.profile.photo && r.settings.template === 'plain') {
		add('info', t.plainNoPhoto, t.plainNoPhotoHint);
	}

	// ── Sections ─────────────────────────────────────────────────────
	if (!r.sections.length) {
		add('error', t.noSections);
	}
	for (const s of r.sections) {
		const heading = s.heading.trim();
		if (!heading) {
			add('warn', t.noHeading);
			continue;
		}
		if (!CANONICAL.includes(heading.toLowerCase())) {
			add('info', t.oddHeading(heading), t.oddHeadingHint);
		}

		if (s.kind !== 'entries') continue;

		// Dates and employers are expected on jobs and degrees. Projects,
		// publications and awards routinely have neither, so don't nag there.
		const dated = /experience|employment|education|experiencia|empleo|educaci|formaci/i.test(heading);

		for (const e of s.entries) {
			const label = e.role.trim() || e.org.trim() || t.untitledEntry;
			if (!e.role.trim()) add('warn', t.entryNoTitle(heading));
			if (dated && !e.org.trim()) add('warn', t.entryNoOrg(heading, label));
			if (dated && !e.start.trim()) {
				add('warn', t.entryNoDates(heading, label), t.entryNoDatesHint);
			}
			for (const b of e.bullets) {
				const n = wordCount(b);
				if (n > LONG_BULLET) {
					add('info', t.longBullet(heading, label, n), t.longBulletHint);
				}
			}
		}

		const bullets = s.entries.flatMap((e) => e.bullets).filter((b) => b.trim());
		if (bullets.length && !bullets.some((b) => /\d/.test(b))) {
			add('info', t.noNumbers(heading), t.noNumbersHint);
		}
	}

	const summary = r.sections.find((s) =>
		/summary|profile|objective|about|resumen|perfil|objetivo|acerca/i.test(s.heading),
	);
	if (summary) {
		const n = wordCount(summary.text);
		if (n > LONG_SUMMARY) {
			add('info', t.longSummary(n), t.longSummaryHint);
		}
	}

	// ── Page fit ─────────────────────────────────────────────────────
	if (ctx.pages > 2) {
		add('warn', t.tooManyPages(ctx.pages), t.tooManyPagesHint);
	} else if (ctx.pages > 1 && r.settings.density !== 'tight') {
		add('info', t.tooManyPages(ctx.pages), t.overOnePageHint);
	}
	// Measured against a real printed PDF, not assumed: Chrome emits side-by-side
	// columns interleaved by vertical position, so a sidebar lands mid-sentence
	// inside the main column when the text is pulled back out.
	if (ctx.interleaved) {
		add('warn', t.interleaved, t.interleavedHint);
	}
	if (r.settings.template === 'rail' && ctx.pages > 1) {
		add('info', t.railLong, t.railLongHint);
	}

	// ── The printed code ─────────────────────────────────────────────
	if (ctx.qrStale) {
		add('warn', t.qrStale, t.qrStaleHint);
	}
	if (ctx.qrDensity !== null && ctx.qrDensity < 0.25) {
		add('error', t.qrDense(ctx.qrDensity.toFixed(2)), t.qrDenseHint);
	} else if (ctx.qrDensity !== null && ctx.qrDensity < 0.33) {
		add('info', t.qrMarginal(ctx.qrDensity.toFixed(2)), t.qrMarginalHint);
	}

	// ── Extracted text ───────────────────────────────────────────────
	const total = wordCount(ctx.extracted);
	if (total > 0 && total < 200) {
		add('info', t.thin(total), t.thinHint);
	}
	if (r.profile.email.trim() && !ctx.extracted.includes(r.profile.email.trim())) {
		add('error', t.emailMissing, t.emailMissingHint);
	}

	const order: Record<Level, number> = { error: 0, warn: 1, info: 2 };
	return out.sort((a, b) => order[a.level] - order[b.level]);
}
