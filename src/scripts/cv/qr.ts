// A QR encoder, written here rather than pulled in as a dependency because the
// whole page is a promise that nothing loads from anywhere else.
//
// The one feature that matters for this project is **mixed-mode segments**.
// QR's byte mode spends 8 bits per character; its alphanumeric mode spends 5.5,
// but only over a 45-character alphabet (digits, uppercase, and ` $%*+-./:`).
// A CV encoded as base64 needs byte mode and does not fit in any QR symbol. The
// same CV re-encoded into an alphabet drawn from that alphanumeric table fits,
// with room to spare — see share.ts. So this encoder emits one byte segment for
// the URL prefix and one alphanumeric segment for the payload.

export type Ecc = 'L' | 'M' | 'Q' | 'H';

export type QrCode = {
	version: number;
	ecc: Ecc;
	/** Modules per side, excluding the quiet zone. */
	size: number;
	/** `modules[y][x]` — true is dark. */
	modules: boolean[][];
};

// ── Capacity tables ────────────────────────────────────────────────────
// Indexed [version], 0 unused.
const ECC_CODEWORDS_PER_BLOCK: Record<Ecc, number[]> = {
	L: [0, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
	M: [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
	Q: [0, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
	H: [0, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
};
const NUM_BLOCKS: Record<Ecc, number[]> = {
	L: [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
	M: [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
	Q: [0, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
	H: [0, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
};
const ECC_FORMAT_BITS: Record<Ecc, number> = { L: 1, M: 0, Q: 3, H: 2 };

/** QR's alphanumeric alphabet, in index order. */
export const QR_ALPHANUMERIC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

// ── Bit plumbing ───────────────────────────────────────────────────────
type Segment = { mode: 'byte' | 'alnum'; chars: number; bits: number[] };

function pushBits(out: number[], value: number, length: number): void {
	for (let i = length - 1; i >= 0; i--) out.push((value >>> i) & 1);
}

export function byteSegment(text: string): Segment {
	const bytes = new TextEncoder().encode(text);
	const bits: number[] = [];
	for (const b of bytes) pushBits(bits, b, 8);
	return { mode: 'byte', chars: bytes.length, bits };
}

/** Throws if the text contains anything outside QR's alphanumeric table. */
export function alnumSegment(text: string): Segment {
	const bits: number[] = [];
	for (let i = 0; i < text.length; ) {
		const a = QR_ALPHANUMERIC.indexOf(text[i]);
		if (a < 0) throw new Error(`"${text[i]}" is not a QR alphanumeric character.`);
		if (i + 1 < text.length) {
			const b = QR_ALPHANUMERIC.indexOf(text[i + 1]);
			if (b < 0) throw new Error(`"${text[i + 1]}" is not a QR alphanumeric character.`);
			pushBits(bits, a * 45 + b, 11);
			i += 2;
		} else {
			pushBits(bits, a, 6);
			i += 1;
		}
	}
	return { mode: 'alnum', chars: text.length, bits };
}

function charCountBits(mode: Segment['mode'], version: number): number {
	if (mode === 'byte') return version <= 9 ? 8 : 16;
	return version <= 9 ? 9 : version <= 26 ? 11 : 13;
}

function segmentBitLength(segs: Segment[], version: number): number {
	let total = 0;
	for (const s of segs) total += 4 + charCountBits(s.mode, version) + s.bits.length;
	return total;
}

// ── Capacity maths ─────────────────────────────────────────────────────
function rawDataModules(version: number): number {
	let result = (16 * version + 128) * version + 64;
	if (version >= 2) {
		const numAlign = Math.floor(version / 7) + 2;
		result -= (25 * numAlign - 10) * numAlign - 55;
		if (version >= 7) result -= 36;
	}
	return result;
}

export function dataCodewords(version: number, ecc: Ecc): number {
	return (
		Math.floor(rawDataModules(version) / 8) -
		ECC_CODEWORDS_PER_BLOCK[ecc][version] * NUM_BLOCKS[ecc][version]
	);
}

// ── Reed–Solomon over GF(256), primitive polynomial 0x11D ──────────────
function gfMul(x: number, y: number): number {
	let z = 0;
	for (let i = 7; i >= 0; i--) {
		z = (z << 1) ^ ((z >>> 7) * 0x11d);
		z ^= ((y >>> i) & 1) * x;
	}
	return z & 0xff;
}

function rsDivisor(degree: number): Uint8Array {
	const result = new Uint8Array(degree);
	result[degree - 1] = 1;
	let root = 1;
	for (let i = 0; i < degree; i++) {
		for (let j = 0; j < degree; j++) {
			result[j] = gfMul(result[j], root);
			if (j + 1 < degree) result[j] ^= result[j + 1];
		}
		root = gfMul(root, 0x02);
	}
	return result;
}

function rsRemainder(data: Uint8Array, divisor: Uint8Array): Uint8Array {
	const result = new Uint8Array(divisor.length);
	for (const b of data) {
		const factor = b ^ result[0];
		result.copyWithin(0, 1);
		result[result.length - 1] = 0;
		for (let i = 0; i < divisor.length; i++) result[i] ^= gfMul(divisor[i], factor);
	}
	return result;
}

/** Split into blocks, add ECC, interleave — the standard QR layout. */
function addEcc(data: Uint8Array, version: number, ecc: Ecc): Uint8Array {
	const numBlocks = NUM_BLOCKS[ecc][version];
	const eccLen = ECC_CODEWORDS_PER_BLOCK[ecc][version];
	const rawCodewords = Math.floor(rawDataModules(version) / 8);
	const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
	/** Total codewords (data + ECC) in a short block. */
	const shortBlockLen = Math.floor(rawCodewords / numBlocks);
	/** Index of the data slot that only long blocks actually use. */
	const splitIndex = shortBlockLen - eccLen;

	const divisor = rsDivisor(eccLen);
	const blocks: Uint8Array[] = [];
	for (let i = 0, k = 0; i < numBlocks; i++) {
		const dataLen = splitIndex + (i < numShortBlocks ? 0 : 1);
		const dat = data.subarray(k, k + dataLen);
		k += dataLen;
		// Every block is padded to the same length so the interleave below is a
		// straight column walk; short blocks carry an unused placeholder at
		// `splitIndex`, which the walk skips.
		const block = new Uint8Array(shortBlockLen + 1);
		block.set(dat);
		block.set(rsRemainder(dat, divisor), shortBlockLen + 1 - eccLen);
		blocks.push(block);
	}

	const out = new Uint8Array(rawCodewords);
	let o = 0;
	for (let i = 0; i < shortBlockLen + 1; i++) {
		for (let b = 0; b < numBlocks; b++) {
			if (i === splitIndex && b < numShortBlocks) continue;
			out[o++] = blocks[b][i];
		}
	}
	return out;
}

// ── Symbol construction ────────────────────────────────────────────────
function alignmentPositions(version: number): number[] {
	if (version === 1) return [];
	const count = Math.floor(version / 7) + 2;
	const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (count * 2 - 2)) * 2;
	const pos = [6];
	for (let p = version * 4 + 10; pos.length < count; p -= step) pos.splice(1, 0, p);
	return pos;
}

class Grid {
	size: number;
	modules: boolean[][];
	reserved: boolean[][];

	constructor(version: number) {
		this.size = version * 4 + 17;
		this.modules = Array.from({ length: this.size }, () => new Array<boolean>(this.size).fill(false));
		this.reserved = Array.from({ length: this.size }, () => new Array<boolean>(this.size).fill(false));
	}

	set(x: number, y: number, dark: boolean, reserve = true): void {
		this.modules[y][x] = dark;
		if (reserve) this.reserved[y][x] = true;
	}
}

function drawFinder(g: Grid, cx: number, cy: number): void {
	for (let dy = -4; dy <= 4; dy++) {
		for (let dx = -4; dx <= 4; dx++) {
			const x = cx + dx;
			const y = cy + dy;
			if (x < 0 || x >= g.size || y < 0 || y >= g.size) continue;
			const d = Math.max(Math.abs(dx), Math.abs(dy));
			g.set(x, y, d !== 2 && d !== 4);
		}
	}
}

function drawFunctionPatterns(g: Grid, version: number): void {
	// Timing patterns
	for (let i = 0; i < g.size; i++) {
		g.set(6, i, i % 2 === 0);
		g.set(i, 6, i % 2 === 0);
	}
	drawFinder(g, 3, 3);
	drawFinder(g, g.size - 4, 3);
	drawFinder(g, 3, g.size - 4);

	const align = alignmentPositions(version);
	for (let i = 0; i < align.length; i++) {
		for (let j = 0; j < align.length; j++) {
			// Skip the three corners already occupied by finder patterns.
			if ((i === 0 && j === 0) || (i === 0 && j === align.length - 1) || (i === align.length - 1 && j === 0)) {
				continue;
			}
			for (let dy = -2; dy <= 2; dy++) {
				for (let dx = -2; dx <= 2; dx++) {
					g.set(align[i] + dx, align[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
				}
			}
		}
	}

	// Format areas are reserved now and written after masking.
	drawFormatBits(g, 'L', 0, true);

	if (version >= 7) {
		let rem = version;
		for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
		const bits = (version << 12) | rem;
		for (let i = 0; i < 18; i++) {
			const dark = ((bits >>> i) & 1) !== 0;
			const a = g.size - 11 + (i % 3);
			const b = Math.floor(i / 3);
			g.set(a, b, dark);
			g.set(b, a, dark);
		}
	}

	// Always-dark module beside the lower-left finder.
	g.set(8, g.size - 8, true);
}

function drawFormatBits(g: Grid, ecc: Ecc, mask: number, reserveOnly = false): void {
	const data = (ECC_FORMAT_BITS[ecc] << 3) | mask;
	let rem = data;
	for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
	const bits = ((data << 10) | rem) ^ 0x5412;

	const bit = (i: number) => (reserveOnly ? false : ((bits >>> i) & 1) !== 0);

	for (let i = 0; i <= 5; i++) g.set(8, i, bit(i));
	g.set(8, 7, bit(6));
	g.set(8, 8, bit(7));
	g.set(7, 8, bit(8));
	for (let i = 9; i < 15; i++) g.set(14 - i, 8, bit(i));

	for (let i = 0; i < 8; i++) g.set(g.size - 1 - i, 8, bit(i));
	for (let i = 8; i < 15; i++) g.set(8, g.size - 15 + i, bit(i));
}

function drawCodewords(g: Grid, data: Uint8Array): void {
	let i = 0;
	for (let right = g.size - 1; right >= 1; right -= 2) {
		if (right === 6) right = 5; // the vertical timing column is skipped
		for (let vert = 0; vert < g.size; vert++) {
			for (let j = 0; j < 2; j++) {
				const x = right - j;
				const upward = ((right + 1) & 2) === 0;
				const y = upward ? g.size - 1 - vert : vert;
				if (g.reserved[y][x]) continue;
				if (i < data.length * 8) {
					g.modules[y][x] = ((data[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0;
					i++;
				}
			}
		}
	}
}

function maskBit(mask: number, x: number, y: number): boolean {
	switch (mask) {
		case 0: return (x + y) % 2 === 0;
		case 1: return y % 2 === 0;
		case 2: return x % 3 === 0;
		case 3: return (x + y) % 3 === 0;
		case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
		case 5: return ((x * y) % 2) + ((x * y) % 3) === 0;
		case 6: return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
		default: return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
	}
}

function applyMask(g: Grid, mask: number): void {
	for (let y = 0; y < g.size; y++) {
		for (let x = 0; x < g.size; x++) {
			if (!g.reserved[y][x] && maskBit(mask, x, y)) g.modules[y][x] = !g.modules[y][x];
		}
	}
}

function penalty(g: Grid): number {
	const n = g.size;
	let score = 0;

	const runScore = (run: number) => (run >= 5 ? 3 + (run - 5) : 0);

	for (let y = 0; y < n; y++) {
		let run = 1;
		for (let x = 1; x < n; x++) {
			if (g.modules[y][x] === g.modules[y][x - 1]) run++;
			else {
				score += runScore(run);
				run = 1;
			}
		}
		score += runScore(run);
	}
	for (let x = 0; x < n; x++) {
		let run = 1;
		for (let y = 1; y < n; y++) {
			if (g.modules[y][x] === g.modules[y - 1][x]) run++;
			else {
				score += runScore(run);
				run = 1;
			}
		}
		score += runScore(run);
	}

	for (let y = 0; y < n - 1; y++) {
		for (let x = 0; x < n - 1; x++) {
			const c = g.modules[y][x];
			if (c === g.modules[y][x + 1] && c === g.modules[y + 1][x] && c === g.modules[y + 1][x + 1]) score += 3;
		}
	}

	// 1:1:3:1:1 finder-like patterns with four light modules on either side.
	const pattern = [true, false, true, true, true, false, true];
	const matches = (get: (i: number) => boolean, i: number, len: number): boolean => {
		for (let k = 0; k < 7; k++) if (get(i + k) !== pattern[k]) return false;
		const before = (from: number) => {
			for (let k = 0; k < 4; k++) {
				const idx = from - 1 - k;
				if (idx < 0) continue;
				if (get(idx)) return false;
			}
			return true;
		};
		const after = (from: number) => {
			for (let k = 0; k < 4; k++) {
				const idx = from + k;
				if (idx >= len) continue;
				if (get(idx)) return false;
			}
			return true;
		};
		return before(i) || after(i + 7);
	};
	for (let y = 0; y < n; y++) {
		for (let x = 0; x + 7 <= n; x++) if (matches((i) => g.modules[y][i], x, n)) score += 40;
	}
	for (let x = 0; x < n; x++) {
		for (let y = 0; y + 7 <= n; y++) if (matches((i) => g.modules[i][x], y, n)) score += 40;
	}

	let dark = 0;
	for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (g.modules[y][x]) dark++;
	const total = n * n;
	score += Math.floor(Math.abs(dark * 20 - total * 10) / total) * 10;

	return score;
}

// ── Public API ─────────────────────────────────────────────────────────

/** Smallest version that fits, or null when the payload is over capacity. */
export function fitVersion(segs: Segment[], ecc: Ecc, minVersion = 1, maxVersion = 40): number | null {
	for (let v = minVersion; v <= maxVersion; v++) {
		if (segmentBitLength(segs, v) <= dataCodewords(v, ecc) * 8) return v;
	}
	return null;
}

export function encodeSegments(
	segs: Segment[],
	ecc: Ecc,
	minVersion = 1,
	maxVersion = 40,
	forceMask = -1,
): QrCode | null {
	const version = fitVersion(segs, ecc, minVersion, maxVersion);
	if (version === null) return null;

	const capacityBits = dataCodewords(version, ecc) * 8;
	const bits: number[] = [];
	for (const s of segs) {
		pushBits(bits, s.mode === 'byte' ? 0b0100 : 0b0010, 4);
		pushBits(bits, s.chars, charCountBits(s.mode, version));
		for (const b of s.bits) bits.push(b);
	}
	// Terminator, then pad to a byte boundary, then alternating pad codewords.
	for (let i = 0; i < 4 && bits.length < capacityBits; i++) bits.push(0);
	while (bits.length % 8 !== 0) bits.push(0);
	for (let pad = 0xec; bits.length < capacityBits; pad ^= 0xec ^ 0x11) pushBits(bits, pad, 8);

	const data = new Uint8Array(bits.length / 8);
	for (let i = 0; i < bits.length; i++) data[i >>> 3] |= bits[i] << (7 - (i & 7));

	const codewords = addEcc(data, version, ecc);

	const g = new Grid(version);
	drawFunctionPatterns(g, version);
	drawCodewords(g, codewords);

	let bestScore = Infinity;
	let bestModules: boolean[][] = [];
	for (let mask = 0; mask < 8; mask++) {
		if (forceMask >= 0 && mask !== forceMask) continue;
		applyMask(g, mask);
		drawFormatBits(g, ecc, mask);
		const score = penalty(g);
		if (score < bestScore) {
			bestScore = score;
			bestModules = g.modules.map((row) => row.slice());
		}
		applyMask(g, mask); // XOR again to undo
	}

	return { version, ecc, size: g.size, modules: bestModules };
}

/** Convenience: encode plain text as a single byte segment. */
export function encodeText(text: string, ecc: Ecc = 'M'): QrCode | null {
	return encodeSegments([byteSegment(text)], ecc);
}

export type SvgOptions = {
	/** Printed edge length, as a CSS length (e.g. "24mm"). */
	size: string;
	/** Quiet zone in modules. The spec says 4; scanners want at least 2. */
	quiet?: number;
	dark?: string;
	light?: string;
};

/**
 * Vector output, so the code stays exact at any print resolution — a bitmap
 * would resample and smear module edges at these densities.
 */
export function qrToSvg(qr: QrCode, opts: SvgOptions): string {
	const quiet = opts.quiet ?? 4;
	const dim = qr.size + quiet * 2;
	const dark = opts.dark ?? '#000';
	const light = opts.light ?? '#fff';

	let path = '';
	for (let y = 0; y < qr.size; y++) {
		for (let x = 0; x < qr.size; x++) {
			if (qr.modules[y][x]) path += `M${x + quiet} ${y + quiet}h1v1h-1z`;
		}
	}

	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" ` +
		`width="${opts.size}" height="${opts.size}" shape-rendering="crispEdges" role="img">` +
		`<rect width="${dim}" height="${dim}" fill="${light}"/>` +
		`<path d="${path}" fill="${dark}"/>` +
		`</svg>`
	);
}
