// Two-locale routing helpers.
//
// English lives at the bare paths (`/projects`) and Spanish under a prefix
// (`/es/projects`). English is unprefixed deliberately: it was here first, the
// links are already indexed, and moving it to `/en/` would break every one of
// them for the sake of symmetry.
//
// Not every page is translated. The posts — Vault entries, blog, rants — are
// written once, in English, and the pages that list them follow. So the helpers
// here distinguish "the same page in the other language" from "the closest page
// that exists in the other language", and callers that would otherwise emit a
// link to a URL that was never built use the latter.

export const languages = {
	en: 'English',
	es: 'Español',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'en';

/** Every locale, default first. */
export const langs = Object.keys(languages) as Lang[];

/**
 * Pages that exist in both locales. Adding a page under `src/pages/es/` means
 * adding it here too, or the switcher will keep routing to its ancestor.
 */
const TRANSLATED = ['/', '/projects', '/about', '/interviews', '/vault', '/cv'];

/** Trailing-slash-insensitive key for comparing paths. */
function key(path: string): string {
	const bare = stripLang(path);
	const trimmed = bare.replace(/\/+$/, '');
	return trimmed === '' ? '/' : trimmed;
}

/**
 * Which locale a URL belongs to. Anything not under `/es/` is English, so a
 * page that forgets to declare itself still renders rather than 404ing.
 */
export function getLangFromUrl(url: URL): Lang {
	const [, first] = url.pathname.split('/');
	return first === 'es' ? 'es' : defaultLang;
}

/**
 * Rewrite a site-root path into `lang`. Takes and returns leading-slash paths,
 * and preserves the trailing slash it was given so links don't bounce through a
 * redirect on the way to the built file.
 *
 *   localizePath('/projects', 'es') === '/es/projects'
 *   localizePath('/projects', 'en') === '/projects'
 */
export function localizePath(path: string, lang: Lang): string {
	const bare = stripLang(path);
	if (lang === defaultLang) return bare;
	return bare === '/' ? '/es/' : `/es${bare}`;
}

/** The same page with any locale prefix removed. */
export function stripLang(path: string): string {
	const withSlash = path.startsWith('/') ? path : `/${path}`;
	if (withSlash === '/es' || withSlash === '/es/') return '/';
	return withSlash.startsWith('/es/') ? withSlash.slice(3) : withSlash;
}

/** True when this exact page was authored in both languages. */
export function hasTranslation(path: string): boolean {
	return TRANSLATED.includes(key(path));
}

/**
 * The closest ancestor that does exist in both languages — so the switcher on a
 * Vault entry offers the Spanish Vault index rather than a URL that was never
 * built, and on a blog post falls back to the home page.
 */
export function nearestTranslated(path: string): string {
	const parts = key(path).split('/').filter(Boolean);
	for (let n = parts.length; n > 0; n--) {
		const candidate = `/${parts.slice(0, n).join('/')}`;
		if (TRANSLATED.includes(candidate)) return candidate;
	}
	return '/';
}

/**
 * Where the language switcher should point from `url`. Exact counterpart when
 * there is one, nearest translated ancestor otherwise.
 */
export function switchTargets(url: URL): Record<Lang, string> {
	const target = hasTranslation(url.pathname) ? stripLang(url.pathname) : nearestTranslated(url.pathname);
	return {
		en: localizePath(target, 'en'),
		es: localizePath(target, 'es'),
	};
}

/**
 * `hreflang` alternates for the current page, or null when this page has no
 * counterpart — declaring one that 404s is worse than declaring none.
 */
export function alternates(url: URL): Record<Lang, string> | null {
	if (!hasTranslation(url.pathname)) return null;
	const bare = stripLang(url.pathname);
	return {
		en: localizePath(bare, 'en'),
		es: localizePath(bare, 'es'),
	};
}
