// Shortening, via TinyURL's keyless endpoint.
//
// This is the one place in the tool that sends your CV somewhere. It is never
// automatic: it runs only when the Shorten button is pressed, and the UI says
// what it does before you press it. Everything else — editing, printing, the
// self-contained link — still happens entirely in the tab.
//
// Chosen after testing the alternatives: is.gd rejects a full-length CV URL
// ("Error, database insert failed") and sends no CORS header at all, so a
// browser could not call it even for short links. TinyURL accepted a 3423
// character URL, reflects the Origin header, and returned the long URL
// byte-identical on resolution — including the `$` and `*` that the base42
// alphabet uses.
//
// The tradeoff to be honest about: a shortened code is only as durable as
// TinyURL. Printed CVs get scanned months later, and shorteners do die —
// goo.gl was switched off entirely. The self-contained link has the CV *inside*
// it and cannot rot, which is why it stays the default and the fallback.

import { s } from './i18n';

const ENDPOINT = 'https://tinyurl.com/api-create.php';

export type ShortenResult = { url: string } | { error: string };

export async function shorten(longUrl: string): Promise<ShortenResult> {
	let res: Response;
	try {
		res = await fetch(`${ENDPOINT}?url=${encodeURIComponent(longUrl)}`, {
			method: 'GET',
			mode: 'cors',
			credentials: 'omit',
		});
	} catch {
		return { error: s().tinyurl.unreachable };
	}

	if (!res.ok) {
		return { error: s().tinyurl.status(res.status) };
	}

	const body = (await res.text()).trim();
	if (!/^https?:\/\/(www\.)?tinyurl\.com\/\w+$/i.test(body)) {
		// The API reports failures as a plain-text body with a 200 status.
		return { error: s().tinyurl.refused(body.slice(0, 120)) };
	}
	return { url: body };
}

/**
 * Cheap digest used to notice that the CV changed after it was shortened.
 * Not a security hash — it only has to catch edits, and a stale short link is
 * the one genuinely dangerous failure here: it would print a code pointing at
 * an older version of someone's CV.
 */
export function digest(text: string): string {
	let h1 = 0x811c9dc5;
	let h2 = 0x01000193;
	for (let i = 0; i < text.length; i++) {
		const c = text.charCodeAt(i);
		h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
		h2 = Math.imul(h2 + c, 0x85ebca6b) >>> 0;
	}
	return `${h1.toString(36)}${h2.toString(36)}`;
}
