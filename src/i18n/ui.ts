// Site chrome: the strings that appear on every page.
//
// Page bodies keep their own modules (`home.ts`, `about.ts`, …) because they
// carry paragraphs rather than labels, and mixing the two makes both harder to
// scan. Anything here is a nav item or metadata.

import type { Lang } from './index';

export const ui = {
	en: {
		'nav.home': 'Home',
		'nav.projects': 'Projects',
		'nav.vault': 'Vault',
		'nav.interviews': 'Interviews',
		'nav.about': 'About',
		'nav.github': 'GitHub',

		'lang.label': 'Language',
		'lang.switchTo': 'Ver en español',

		'site.description':
			'Full-stack engineer in Buenos Aires. I build production SaaS and automate annoying things.',
	},
	es: {
		'nav.home': 'Inicio',
		'nav.projects': 'Proyectos',
		// The page's own title is "La Bóveda"; the nav drops the article, exactly
		// as the English nav says "Vault" for a page titled "The Vault".
		'nav.vault': 'Bóveda',
		'nav.interviews': 'Entrevistas',
		'nav.about': 'Sobre mí',
		'nav.github': 'GitHub',

		'lang.label': 'Idioma',
		'lang.switchTo': 'View in English',

		'site.description':
			'Ingeniero full-stack en Buenos Aires. Construyo SaaS en producción y automatizo cosas molestas.',
	},
} as const;

export type UiKey = keyof (typeof ui)['en'];

/** `t('nav.home')` for the given locale, falling back to English. */
export function useTranslations(lang: Lang) {
	return function t(key: UiKey): string {
		return ui[lang][key] ?? ui.en[key];
	};
}
