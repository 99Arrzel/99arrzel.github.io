// localStorage, and nothing but localStorage. No account, no upload, no sync.
//
// Markdown is what gets stored — not the parsed model — so the saved bytes are
// the same bytes the export button hands you, and a future version of the
// parser can still read documents written by this one.

const KEY_DOCS = 'cv:docs';
const KEY_ACTIVE = 'cv:active';
const KEY_SEEN = 'cv:seen';

export type Doc = { id: string; name: string; markdown: string; updatedAt: number };

export function newId(): string {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
	return `d${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
}

function read<T>(key: string, fallback: T): T {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

/** Returns false when the write failed (quota, private mode) so the UI can say so. */
function write(key: string, value: unknown): boolean {
	try {
		localStorage.setItem(key, JSON.stringify(value));
		return true;
	} catch {
		return false;
	}
}

export function loadDocs(): Doc[] {
	const docs = read<Doc[]>(KEY_DOCS, []);
	if (!Array.isArray(docs)) return [];
	return docs.filter((d): d is Doc => !!d && typeof d.id === 'string' && typeof d.markdown === 'string');
}

export function saveDocs(docs: Doc[]): boolean {
	return write(KEY_DOCS, docs);
}

export function getActiveId(): string | null {
	try {
		return localStorage.getItem(KEY_ACTIVE);
	} catch {
		return null;
	}
}

export function setActiveId(id: string): void {
	try {
		localStorage.setItem(KEY_ACTIVE, id);
	} catch {
		/* nothing useful to do; the doc list still works for this session */
	}
}

export function makeDoc(name: string, markdown: string): Doc {
	return { id: newId(), name, markdown, updatedAt: Date.now() };
}

export function seen(flag: string): boolean {
	const s = read<Record<string, boolean>>(KEY_SEEN, {});
	return s[flag] === true;
}

export function markSeen(flag: string): void {
	const s = read<Record<string, boolean>>(KEY_SEEN, {});
	s[flag] = true;
	write(KEY_SEEN, s);
}

export const STORAGE_KEYS = { KEY_DOCS, KEY_ACTIVE, KEY_SEEN };
