// Profile photos.
//
// The image is centre-cropped to a square, downscaled and re-encoded as JPEG
// before it ever reaches the model. That matters because the photo travels
// inside the markdown as a data URI — so it survives export and import like
// everything else — and a phone camera's 4 MB original would blow through the
// ~5 MB localStorage budget on its own.

import { s } from './i18n';

/** Longest edge of the stored image, in pixels. */
const MAX_EDGE = 480;
const QUALITY = 0.82;

export const PHOTO_MAX_BYTES = 700_000;

/**
 * Reads a user-picked file into a square, downscaled JPEG data URI.
 * Rejects with a human-readable message when the file isn't usable.
 */
export async function readPhoto(file: File): Promise<string> {
	if (!file.type.startsWith('image/')) {
		throw new Error(s().photo.notAnImage(file.name));
	}

	const bitmap = await loadBitmap(file);
	const edge = Math.min(bitmap.width, bitmap.height);
	const size = Math.min(MAX_EDGE, edge);

	const canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error(s().photo.noCanvas);

	// Centre crop: take the largest square from the middle of the original.
	ctx.drawImage(
		bitmap as CanvasImageSource,
		(bitmap.width - edge) / 2,
		(bitmap.height - edge) / 2,
		edge,
		edge,
		0,
		0,
		size,
		size,
	);
	if ('close' in bitmap && typeof bitmap.close === 'function') bitmap.close();

	const url = canvas.toDataURL('image/jpeg', QUALITY);
	if (url.length > PHOTO_MAX_BYTES) {
		throw new Error(s().photo.stillTooBig);
	}
	return url;
}

/**
 * Most people have their photo as a link rather than a file on disk, so a URL
 * is accepted too. It's fetched once, converted to a data URI and then stored
 * like any uploaded file — the sheet never keeps a remote `src`, which would
 * both leak a request every time the CV is opened and print as an empty box if
 * the host were unreachable.
 */
export async function readPhotoFromUrl(raw: string): Promise<string> {
	const url = normalizePhotoUrl(raw);
	let res: Response;
	try {
		res = await fetch(url, { mode: 'cors', credentials: 'omit', redirect: 'follow' });
	} catch {
		throw new Error(
			`Could not read an image from ${hostOf(url)}. That host doesn't allow other sites to fetch its images — save the picture and upload the file instead.`,
		);
	}
	if (!res.ok) throw new Error(`${hostOf(url)} answered ${res.status} for that address.`);

	const blob = await res.blob();
	if (!blob.type.startsWith('image/')) {
		throw new Error('That address is a web page, not an image. Right-click the photo and copy the image address.');
	}
	return readPhoto(new File([blob], 'photo', { type: blob.type }));
}

/** `github.com/someone` is a profile page; `.png` on the end is their avatar. */
function normalizePhotoUrl(raw: string): string {
	let v = raw.trim();
	if (!v) throw new Error('Paste an image address first.');
	if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
	let parsed: URL;
	try {
		parsed = new URL(v);
	} catch {
		throw new Error(`"${raw.trim()}" isn't a valid address.`);
	}
	const gh = /^(?:www\.)?github\.com$/i.test(parsed.hostname) && /^\/([\w-]+)\/?$/.exec(parsed.pathname);
	if (gh) return `https://github.com/${gh[1]}.png?size=460`;
	return parsed.toString();
}

function hostOf(url: string): string {
	try {
		return new URL(url).hostname;
	} catch {
		return 'that address';
	}
}

type Bitmap = ImageBitmap | HTMLImageElement;

async function loadBitmap(file: File): Promise<Bitmap> {
	if (typeof createImageBitmap === 'function') {
		try {
			return await createImageBitmap(file);
		} catch {
			/* fall through to the <img> path below */
		}
	}
	// Safari < 17 and friends: decode through an <img> instead.
	const url = URL.createObjectURL(file);
	try {
		const img = new Image();
		img.src = url;
		await img.decode();
		return img;
	} finally {
		URL.revokeObjectURL(url);
	}
}

/** Rough byte size of a data URI, for the storage warning. */
export function photoBytes(dataUrl: string): number {
	const comma = dataUrl.indexOf(',');
	if (comma === -1) return 0;
	return Math.floor(((dataUrl.length - comma - 1) * 3) / 4);
}
