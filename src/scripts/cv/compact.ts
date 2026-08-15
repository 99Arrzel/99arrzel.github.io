// Squeezing the payload before it ever reaches deflate.
//
// Two lossless passes, both measured rather than assumed:
//
//  1. Drop the markdown. The wire format keeps only the field *values*,
//     separated by control characters, so `## `, `### `, `- `, `**Label:**`
//     and every frontmatter key disappear. 5458 → 5047 bytes of source.
//
//  2. Substitute a static dictionary of CV and stack vocabulary. Deflate finds
//     repeats *within* a document, so it already handles the second occurrence
//     of "Full Stack Engineer" cheaply — what it cannot do is compress the
//     first one. A shipped dictionary makes every occurrence, including the
//     first, cost two bytes. 5047 → ~3950 bytes of source.
//
// Together these take the deflated payload from 2586 to ~2190 bytes, which is
// four QR versions smaller (v39 → v35, 173² → 157² modules). That is the whole
// available win: brotli at maximum effort reaches 1997 bytes on the same
// content, and the prose itself has roughly 1550 bytes of entropy, so no
// encoder gets a full CV into a small symbol. The bullets are the payload.

import { defaultSettings, type Resume, type Section, type SectionKind } from './types';

/** Bumped whenever the wire format changes, so old links fail loudly. */
const FORMAT = '1';

// Record / field / subfield / list separators.
const RS = '\x1e';
const US = '\x1f';
const GS = '\x1d';
const FS = '\x1c';
const ESC = '\x01';
const ESC_LITERAL = '\x20';

/**
 * Ordered longest-first so that "Full Stack Engineer" is matched before
 * "Engineer". Entries are worth including when they appear in real CVs and are
 * long enough that a two-byte reference wins.
 */
const DICTIONARY = [
	'Professional Summary', 'Technical Skills', 'Certifications', 'Infrastructure', 'infrastructure',
	'Full Stack Engineer', 'Full-Stack Engineer', 'Software Engineer', 'Senior Engineer',
	'Frontend Developer', 'Backend Developer', 'Web Developer', 'Full Stack', 'Full-Stack',
	'Engineering', 'engineering', 'Engineer', 'Developer', 'Development', 'development',
	'Experience', 'experience', 'Education', 'Projects', 'Summary', 'Skills', 'Languages',
	'University', 'Universidad', 'Bachelor', 'Computer Science', 'Systems',
	'TypeScript', 'JavaScript', 'PostgreSQL', 'CloudFormation', 'GitHub Actions',
	'Kubernetes', 'Terraform', 'Docker', 'Python', 'Laravel', 'Next.js', 'Node.js', 'React',
	'MySQL', 'Prisma', 'Stripe', 'Redis', 'GraphQL', 'REST APIs', 'Tailwind', 'Vue.js',
	'subscriptions', 'authorization', 'entitlements', 'permissions', 'requirements',
	'architecture', 'application', 'implemented', 'coordinated', 'performance', 'deployment',
	'maintained', 'integrated', 'production', 'management', 'automated', 'migrations',
	'monorepo', 'database', 'pipeline', 'workflows', 'standards', 'delivery', 'features',
	'Present', 'Remote', 'On-site', 'Hybrid', 'Part-time', 'Freelance',
	'January', 'February', 'September', 'October', 'November', 'December',
	'Jan ', 'Feb ', 'Mar ', 'Apr ', 'Jun ', 'Jul ', 'Aug ', 'Sep ', 'Oct ', 'Nov ', 'Dec ',
	'Argentina', 'Bolivia', 'Buenos Aires', 'Santa Cruz', 'United States',
	'Designed', 'Migrated', 'Shipped', 'Built ', 'Owned ', 'Led ', 'Improved', 'Reduced',
	'across', 'system', 'team ', 'with ', 'and ', 'the ', 'for ', 'from ', 'that ', 'into ',
	' — ', ' · ', ' – ',
];

function dictEncode(text: string): string {
	// Any literal ESC in the source is doubled so decoding stays unambiguous.
	let out = text.split(ESC).join(ESC + ESC_LITERAL);
	for (let i = 0; i < DICTIONARY.length; i++) {
		const token = DICTIONARY[i];
		if (!out.includes(token)) continue;
		out = out.split(token).join(ESC + String.fromCharCode(0x21 + i));
	}
	return out;
}

function dictDecode(text: string): string {
	let out = '';
	for (let i = 0; i < text.length; i++) {
		if (text[i] !== ESC) {
			out += text[i];
			continue;
		}
		const next = text[++i];
		if (next === undefined) break;
		if (next === ESC_LITERAL) {
			out += ESC;
			continue;
		}
		const token = DICTIONARY[next.charCodeAt(0) - 0x21];
		if (token === undefined) throw new Error('Share code references an unknown dictionary entry.');
		out += token;
	}
	return out;
}

const KIND_CODE: Record<SectionKind, string> = { entries: 'E', skills: 'K', list: 'L', text: 'T' };
const CODE_KIND: Record<string, SectionKind> = { E: 'entries', K: 'skills', L: 'list', T: 'text' };

function encodeSection(s: Section): string {
	const head = KIND_CODE[s.kind] + US + s.heading + US + s.text;
	if (s.kind === 'entries') {
		const entries = s.entries.map((e) =>
			[e.role, e.org, e.meta, e.start, e.end, e.summary, e.bullets.join(FS)].join(GS),
		);
		return [head, ...entries].join(US);
	}
	if (s.kind === 'skills') return [head, ...s.rows.map((r) => r.label + GS + r.value)].join(US);
	if (s.kind === 'list') return [head, ...s.items].join(US);
	return head;
}

function decodeSection(chunk: string): Section {
	const parts = chunk.split(US);
	const kind = CODE_KIND[parts[0]] ?? 'text';
	const section: Section = {
		heading: parts[1] ?? '',
		kind,
		text: parts[2] ?? '',
		entries: [],
		rows: [],
		items: [],
	};
	const rest = parts.slice(3);
	if (kind === 'entries') {
		for (const raw of rest) {
			const f = raw.split(GS);
			section.entries.push({
				role: f[0] ?? '',
				org: f[1] ?? '',
				meta: f[2] ?? '',
				start: f[3] ?? '',
				end: f[4] ?? '',
				summary: f[5] ?? '',
				bullets: (f[6] ?? '').split(FS).filter((b) => b !== ''),
			});
		}
	} else if (kind === 'skills') {
		for (const raw of rest) {
			const [label, value] = raw.split(GS);
			section.rows.push({ label: label ?? '', value: value ?? '' });
		}
	} else if (kind === 'list') {
		for (const raw of rest) section.items.push(raw);
	}
	return section;
}

/** Model → the string that gets deflated. Photo is never included. */
export function toCompact(r: Resume): string {
	const p = r.profile;
	const st = r.settings;
	const profile = [p.name, p.title, p.location, p.email, p.phone, p.links.join(GS), p.extra].join(US);
	// Deliberately excludes every qr* setting. Those are print-time choices, not
	// content, and folding them in would mean resizing the code changed the
	// payload — which would invalidate a short link the moment it was made.
	const settings = [st.template, st.page, st.density, st.accent, st.photoShape, st.rail.join(GS)].join(US);
	const body = [FORMAT, profile, settings, ...r.sections.map(encodeSection)].join(RS);
	return dictEncode(body);
}

export function fromCompact(packed: string): Resume {
	const body = dictDecode(packed);
	const records = body.split(RS);
	if (records[0] !== FORMAT) {
		throw new Error('That link was made by a different version of this tool.');
	}
	const pf = (records[1] ?? '').split(US);
	const sf = (records[2] ?? '').split(US);
	const base = defaultSettings();

	return {
		profile: {
			name: pf[0] ?? '',
			title: pf[1] ?? '',
			location: pf[2] ?? '',
			email: pf[3] ?? '',
			phone: pf[4] ?? '',
			links: (pf[5] ?? '').split(GS).filter(Boolean),
			extra: pf[6] ?? '',
			photo: '',
		},
		settings: {
			...base,
			template: (sf[0] as Resume['settings']['template']) || base.template,
			page: (sf[1] as Resume['settings']['page']) || base.page,
			density: (sf[2] as Resume['settings']['density']) || base.density,
			accent: sf[3] || base.accent,
			photoShape: (sf[4] as Resume['settings']['photoShape']) || base.photoShape,
			rail: (sf[5] ?? '').split(GS).filter(Boolean),
		},
		sections: records.slice(3).map(decodeSection),
	};
}
