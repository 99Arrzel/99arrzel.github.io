// Putting a whole CV in a link, and that link in a QR code.
//
// The obvious route — deflate, then base64url — does not work. Base64 needs
// QR's *byte* mode at 8 bits per character, and 2571 compressed bytes become
// 3428 base64 characters, which is 27424 bits. The largest QR symbol that
// exists (version 40, error correction L) holds 23648. It does not fit at any
// size, on any printer.
//
// QR also has an *alphanumeric* mode: 5.5 bits per character, over the 45-char
// table `0-9 A-Z $%*+-./: ` and space. So the trick is to re-encode the
// compressed bytes into an alphabet that is simultaneously
//
//   • a subset of that QR table, and
//   • safe to drop into a URL query without percent-escaping.
//
// The intersection is 42 characters: digits, uppercase, and `- . / : $ *`.
// Base42 costs 1.5 characters per byte (worse than base64's 1.33), but each
// character costs 5.5 QR bits instead of 8 — so 2571 bytes become 3857
// characters occupying 21214 bits, and the whole CV fits in a version 38
// symbol with room left over. Measured, not theorised: see the round-trip test
// against an independent decoder in the commit that added this file.


import { CODEC_DEFLATE, canCompress, pack, unpack } from './codec';
import { fromCompact, toCompact } from './compact';
import { parseResume } from './parse';
import { serializeResume } from './serialize';

export { canCompress };

/** The query key, e.g. `…/cv?cv=<payload>`. */
export const SHARE_PARAM = 'cv';

/**
 * QR alphanumeric ∩ URL-query-safe. Deliberately excludes `+` (form decoding
 * turns it into a space), `%` (starts an escape) and space itself.
 */
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-./:$*';
const BASE = ALPHABET.length; // 42
const INDEX: Record<string, number> = {};
for (let i = 0; i < ALPHABET.length; i++) INDEX[ALPHABET[i]] = i;

export const SHARE_ALPHABET = ALPHABET;

// ── Base42, two bytes to three characters ──────────────────────────────
// 42³ = 74088 ≥ 65536, so a 16-bit pair always fits in three digits; a lone
// trailing byte fits in two (42² = 1764 ≥ 256).

export function toBase42(bytes: Uint8Array): string {
	let out = '';
	let i = 0;
	for (; i + 1 < bytes.length; i += 2) {
		let v = bytes[i] * 256 + bytes[i + 1];
		out += ALPHABET[v % BASE];
		v = Math.floor(v / BASE);
		out += ALPHABET[v % BASE];
		out += ALPHABET[Math.floor(v / BASE)];
	}
	if (i < bytes.length) {
		const v = bytes[i];
		out += ALPHABET[v % BASE];
		out += ALPHABET[Math.floor(v / BASE)];
	}
	return out;
}

export function fromBase42(text: string): Uint8Array {
	const out: number[] = [];
	let i = 0;
	for (; i + 2 < text.length; i += 3) {
		const v = INDEX[text[i]] + INDEX[text[i + 1]] * BASE + INDEX[text[i + 2]] * BASE * BASE;
		if (!Number.isFinite(v) || v > 0xffff) throw new Error('Corrupt share code.');
		out.push(v >> 8, v & 0xff);
	}
	if (i < text.length) {
		if (text.length - i !== 2) throw new Error('Corrupt share code.');
		const v = INDEX[text[i]] + INDEX[text[i + 1]] * BASE;
		if (!Number.isFinite(v) || v > 0xff) throw new Error('Corrupt share code.');
		out.push(v);
	}
	return new Uint8Array(out);
}

/**
 * The photo never travels. A JPEG is already entropy-coded so deflate cannot
 * shrink it, and 20 KB of base64 would multiply the link length by seven for
 * something the recipient can re-add in two clicks.
 */
export function stripPhoto(markdown: string): string {
	return markdown.replace(/^photo:.*$/m, '').replace(/\n{3,}/g, '\n\n');
}

/**
 * Model → link payload. The markdown is thrown away first: see compact.ts for
 * why the wire format is field values plus a shipped dictionary rather than the
 * document you type.
 */
export async function encodePayload(markdown: string): Promise<string> {
	const resume = parseResume(stripPhoto(markdown));
	const packed = await pack(toCompact(resume));
	// The codec tag rides outside the compressed bytes, since the decoder has to
	// read it before it can decompress anything.
	return packed.codec + toBase42(packed.bytes);
}

export async function decodePayload(payload: string): Promise<string> {
	const clean = payload.trim();
	if (clean.length < 2) throw new Error('That link carries no CV.');
	const codec = clean[0];
	const body = clean.slice(1);
	for (const ch of body) {
		if (!(ch in INDEX)) throw new Error('That link contains characters this format never produces.');
	}
	return serializeResume(fromCompact(await unpack(codec, fromBase42(body))));
}

/** Which codec a payload was written with, for the size readout. */
export function payloadCodec(payload: string): string {
	return payload[0] === CODEC_DEFLATE ? 'deflate' : 'brotli';
}

// ── URLs ───────────────────────────────────────────────────────────────

/**
 * Built by concatenation rather than `URLSearchParams`, which percent-encodes
 * `$`, `/` and `:` — that would both lengthen the link and knock the payload
 * out of QR's alphanumeric mode, which is the entire point of the alphabet.
 */
export function buildShareUrl(base: string, payload: string, useHash: boolean): string {
	return `${base}${useHash ? '#' : '?'}${SHARE_PARAM}=${payload}`;
}

/** Accepts the payload from either the query string or the fragment. */
export function readShareParam(loc: { search: string; hash: string }): string | null {
	const grab = (s: string): string | null => {
		const m = new RegExp(`(?:^|[?&#])${SHARE_PARAM}=([^&#]+)`).exec(s);
		return m ? decodeURIComponent(m[1]) : null;
	};
	return grab(loc.search) ?? grab(loc.hash);
}

/** What the printed code carries: a link that reconstitutes the whole CV. */
export async function qrPayload(
	markdown: string,
	base: string,
	useHash: boolean,
): Promise<{ text: string; prefix: string; alnum: string }> {
	const payload = await encodePayload(markdown);
	const prefix = `${base}${useHash ? '#' : '?'}${SHARE_PARAM}=`;
	return { text: prefix + payload, prefix, alnum: payload };
}
