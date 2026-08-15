// Resume -> markdown. The exact inverse of parse.ts.
//
// Markdown stays the storage format (that's what lives in localStorage and
// what the export button hands you), while the form edits the model. So this
// runs on every keystroke and has to round-trip cleanly: parse(serialize(r))
// must equal r.

import type { Resume, Section } from './types';
import { s as strings } from './i18n';

function yamlValue(v: string): string {
	// Quote only when a bare scalar would be ambiguous to the parser.
	return /^[\s'"]|[:#]\s|\s$/.test(v) ? JSON.stringify(v) : v;
}

function entryHead(role: string, org: string, meta: string): string {
	let head = role.trim();
	if (org.trim()) head += ` @ ${org.trim()}`;
	if (meta.trim()) head += ` — ${meta.trim()}`;
	return head;
}

function serializeSection(s: Section): string[] {
	const out: string[] = [`## ${s.heading.trim() || strings().form.untitledSection}`, ''];

	if (s.text.trim()) {
		out.push(s.text.trim(), '');
	}

	if (s.kind === 'skills') {
		for (const row of s.rows) {
			if (!row.label.trim() && !row.value.trim()) continue;
			out.push(`**${row.label.trim()}:** ${row.value.trim()}`.trimEnd());
		}
		if (s.rows.length) out.push('');
	}

	if (s.kind === 'list') {
		for (const item of s.items) {
			if (!item.trim()) continue;
			out.push(`- ${item.trim()}`);
		}
		if (s.items.length) out.push('');
	}

	if (s.kind === 'entries') {
		for (const e of s.entries) {
			const head = entryHead(e.role, e.org, e.meta);
			if (!head && !e.summary.trim() && !e.bullets.some((b) => b.trim())) continue;
			out.push(`### ${head}`);
			const dates = [e.start.trim(), e.end.trim()].filter(Boolean).join(' – ');
			if (dates) out.push(dates);
			out.push('');
			if (e.summary.trim()) out.push(e.summary.trim(), '');
			for (const b of e.bullets) {
				if (!b.trim()) continue;
				out.push(`- ${b.trim().replace(/\s*\n\s*/g, ' ')}`);
			}
			if (e.bullets.some((b) => b.trim())) out.push('');
		}
	}

	return out;
}

export function serializeResume(r: Resume): string {
	const { profile: p, settings: st } = r;
	const front: string[] = ['---'];
	const scalar = (k: string, v: string) => {
		if (v.trim()) front.push(`${k}: ${yamlValue(v.trim())}`);
	};
	scalar('name', p.name);
	scalar('title', p.title);
	scalar('location', p.location);
	scalar('email', p.email);
	scalar('phone', p.phone);
	const links = p.links.filter((l) => l.trim());
	if (links.length) {
		front.push('links:');
		for (const l of links) front.push(`  - ${l.trim()}`);
	}
	scalar('extra', p.extra);
	// Long, but it keeps an exported .md self-contained.
	if (p.photo) front.push(`photo: ${p.photo}`);
	front.push(`template: ${st.template}`);
	front.push(`page: ${st.page}`);
	front.push(`density: ${st.density}`);
	front.push(`accent: ${st.accent}`);
	front.push(`photoShape: ${st.photoShape}`);
	if (st.qr) {
		front.push(`qr: ${st.qr}`);
		front.push(`qrEvery: ${st.qrEvery}`);
		front.push(`qrSize: ${st.qrSize}`);
		front.push(`qrHash: ${st.qrHash}`);
		if (st.qrShort) {
			front.push(`qrShort: ${st.qrShort}`);
			front.push(`qrShortFor: ${st.qrShortFor}`);
		}
	}
	const rail = st.rail.filter((h) => h.trim());
	if (rail.length) {
		front.push('rail:');
		for (const h of rail) front.push(`  - ${h.trim()}`);
	}
	front.push('---', '');

	const body: string[] = [];
	for (const s of r.sections) body.push(...serializeSection(s));

	return `${front.join('\n')}\n${body.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}
