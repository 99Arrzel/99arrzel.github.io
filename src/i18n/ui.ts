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
		'nav.linkedin': 'LinkedIn',
		'nav.cv': 'CV',
		'nav.rss': 'RSS',
		'nav.skip': 'Skip to content',

		'lang.label': 'Language',
		'lang.switchTo': 'Ver en español',

		'site.description':
			'Full-stack engineer for US SaaS teams: Stripe billing, legacy PHP to Next.js migrations, AWS pipelines and agentic AI workflows.',
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
		'nav.linkedin': 'LinkedIn',
		'nav.cv': 'CV',
		'nav.rss': 'RSS',
		'nav.skip': 'Saltar al contenido',

		'lang.label': 'Idioma',
		'lang.switchTo': 'View in English',

		'site.description':
			'Ingeniero full-stack para equipos SaaS de EE. UU.: cobros con Stripe, migraciones de PHP a Next.js, pipelines en AWS y flujos de IA agéntica.',
	},
} as const;

export type UiKey = keyof (typeof ui)['en'];

/** `t('nav.home')` for the given locale, falling back to English. */
export function useTranslations(lang: Lang) {
	return function t(key: UiKey): string {
		return ui[lang][key] ?? ui.en[key];
	};
}
