// The "let a chatbot do the typing" helper.
//
// Writing the document format by hand is the one genuinely hard part of this
// tool, and it's the part nobody should have to do. So instead: paste whatever
// you already have — a LinkedIn profile, an old CV, rough notes — and this
// assembles a prompt that turns it into the exact grammar the parser expects.
//
// The instructions below are deliberately strict and repetitive. They are aimed
// at a model that will happily add a friendly preamble, wrap everything in a
// code fence, or invent a plausible-sounding employer if a date looks missing —
// all three of which break the import.

import { s } from './i18n';

/** Where the person's own material gets spliced in. */
const SOURCE_OPEN = '===== BEGIN MY INFORMATION =====';
const SOURCE_CLOSE = '===== END MY INFORMATION =====';

// The instruction block itself lives in i18n.ts, in both languages: it is the
// longest single piece of user-facing copy in the tool, and someone pasting it
// into a chatbot should be able to read what they are sending.

/** Assembles the full prompt: instructions first, the person's material last. */
export function buildPrompt(source: string): string {
	const body = source.trim() || s().prompt.nothingPasted;
	return `${s().prompt.instructions}\n\n${SOURCE_OPEN}\n${body}\n${SOURCE_CLOSE}\n`;
}

/**
 * Models wrap things in code fences no matter how firmly you ask them not to,
 * and chat UIs often add a stray "Here is your CV" line. Strip both so a
 * paste-back still works.
 */
export function cleanLlmReply(raw: string): string {
	let text = raw.replace(/\r\n?/g, '\n').trim();

	// A fenced block anywhere in the reply wins — that's almost always the document.
	const fenced = /```(?:markdown|md|yaml|text)?\n([\s\S]*?)```/i.exec(text);
	if (fenced) text = fenced[1].trim();

	// Otherwise drop any chatter before the frontmatter or the first heading.
	const start = text.search(/^---\s*$/m);
	if (start > 0) {
		text = text.slice(start).trim();
	} else if (start === -1) {
		const heading = text.search(/^##\s+\S/m);
		if (heading > 0) text = text.slice(heading).trim();
	}
	return text.trim();
}

/** A quick sanity check so "Use this" can explain itself when the paste is wrong. */
export function looksLikeCv(text: string): { ok: boolean; reason?: string } {
	if (!text.trim()) return { ok: false, reason: s().prompt.emptyBox };
	if (!/^##\s+\S/m.test(text)) {
		return { ok: false, reason: s().prompt.notCv };
	}
	return { ok: true };
}
