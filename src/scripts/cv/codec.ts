// Compression, with brotli where it's worth loading and deflate as the floor.
//
// Browsers still don't expose brotli: `new CompressionStream('br')` throws in
// Chrome 148, and a synthetic Response with `Content-Encoding: br` isn't
// decoded either. So brotli means shipping wasm — 1.0 MB to compress, and the
// decoder half of it to decompress. That is only defensible because both are
// loaded *lazily*: the encoder when you switch the printed code on, the decoder
// only when a visitor arrives on a `?cv=` link. Someone reading the page
// normally never downloads a byte of it.
//
// Measured on a real CV: deflate 2244 B, brotli 1893 B — 16% smaller, which is
// three QR versions (v36 → v33). Once a link is shortened the QR carries 28
// characters either way, but the smaller payload still matters: shorteners have
// URL length limits (is.gd rejects 3423 characters outright), and the
// self-contained fallback code shrinks with it.
//
// Every payload is tagged with the codec that produced it, so a link made
// before brotli loaded still opens, and a browser that fails to load the wasm
// can still read deflate links.

/** Single-character codec tags. Both live in the base42 alphabet. */
export const CODEC_DEFLATE = 'D';
export const CODEC_BROTLI = 'B';

export type Codec = typeof CODEC_DEFLATE | typeof CODEC_BROTLI;

export function canCompress(): boolean {
	return typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';
}

// ── deflate-raw, native ────────────────────────────────────────────────

/** One-shot source stream, typed as the DOM lib declares the writable side. */
function streamOf(bytes: Uint8Array): ReadableStream<BufferSource> {
	const chunk = new Uint8Array(bytes);
	return new ReadableStream<BufferSource>({
		start(controller) {
			controller.enqueue(chunk);
			controller.close();
		},
	});
}

async function deflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
	const packed = streamOf(bytes).pipeThrough(new CompressionStream('deflate-raw'));
	return new Uint8Array(await new Response(packed).arrayBuffer());
}

async function inflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
	const loose = streamOf(bytes).pipeThrough(new DecompressionStream('deflate-raw'));
	return new Uint8Array(await new Response(loose).arrayBuffer());
}

// ── brotli, lazily loaded wasm ─────────────────────────────────────────

type Brotli = {
	compress(input: Uint8Array, options?: { quality?: number }): Uint8Array;
	decompress(input: Uint8Array): Uint8Array;
};

let brotliPromise: Promise<Brotli | null> | null = null;

/**
 * Resolves to null rather than throwing when the wasm can't be fetched, so a
 * flaky network degrades to deflate instead of breaking the feature.
 */
export function loadBrotli(): Promise<Brotli | null> {
	if (!brotliPromise) {
		brotliPromise = (async () => {
			try {
				// Dynamic, so the 1 MB binary is only fetched once something actually
				// needs to compress or decompress. The package resolves its wasm from
				// import.meta.url, which Vite's dependency optimiser would rewrite and
				// break — astro.config.mjs excludes it from pre-bundling for that
				// reason.
				const mod = await import('brotli-wasm');
				return (await mod.default) as unknown as Brotli;
			} catch {
				return null;
			}
		})();
	}
	return brotliPromise;
}

/** True once the wasm is in memory — lets the UI avoid promising brotli early. */
export function brotliReady(): boolean {
	return brotliPromise !== null;
}

// ── Public API ─────────────────────────────────────────────────────────

export type Packed = { codec: Codec; bytes: Uint8Array };

/** Compresses with brotli when available, otherwise deflate. */
export async function pack(text: string): Promise<Packed> {
	const input = new TextEncoder().encode(text);
	const brotli = await loadBrotli();
	if (brotli) {
		try {
			const bytes = brotli.compress(input, { quality: 11 });
			// Brotli is not unconditionally smaller on tiny inputs; keep whichever
			// actually won rather than assuming.
			const fallback = await deflateRaw(input);
			return bytes.length <= fallback.length
				? { codec: CODEC_BROTLI, bytes }
				: { codec: CODEC_DEFLATE, bytes: fallback };
		} catch {
			/* fall through to deflate */
		}
	}
	return { codec: CODEC_DEFLATE, bytes: await deflateRaw(input) };
}

export async function unpack(codec: string, bytes: Uint8Array): Promise<string> {
	if (codec === CODEC_BROTLI) {
		const brotli = await loadBrotli();
		if (!brotli) throw new Error('This link needs the brotli decoder, which could not be loaded.');
		return new TextDecoder().decode(brotli.decompress(bytes));
	}
	if (codec === CODEC_DEFLATE) return new TextDecoder().decode(await inflateRaw(bytes));
	throw new Error(`Unknown compression tag "${codec}" in that link.`);
}
