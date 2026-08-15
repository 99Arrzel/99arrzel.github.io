// Copy for the Vault index.
//
// The entries themselves are written in English and stay that way — the
// Spanish index is a translated way in to the same archive, not a second
// archive. Topic names and blurbs are chrome, so they do get translated; the
// topic *ids* in `src/vault.ts` are what the frontmatter keys off and never
// change.

import type { Lang } from './index';
import { VAULT_TOPIC_ORDER, type VaultTopicId } from '../vault';

type TopicCopy = { name: string; blurb: string };

type VaultCopy = {
	metaTitle: string;
	metaDescription: string;
	title: string;
	intro: string;
	empty: string;
	navAria: string;
	/** Shown above the entry list when the archive isn't in the reader's language. */
	languageNote?: string;
	topics: Record<VaultTopicId, TopicCopy>;
};

export const vault: Record<Lang, VaultCopy> = {
	en: {
		metaTitle: 'The Vault',
		metaDescription: 'A personal archive — thoughts, how-tos, and notes from me to future me.',
		title: 'The Vault',
		intro:
			'A personal archive. Half notes-to-future-me, half showing how things are done — thoughts on software, existential detours, the occasional how-to, and whatever else I want to be able to reread later.',
		empty: 'Nothing in here yet. Check back soon.',
		navAria: 'Vault topics',
		topics: {
			engineering: {
				name: 'Engineering',
				blurb: 'Software architecture, how-tos, and how things actually get built.',
			},
			building: {
				name: 'Building',
				blurb: 'SaaS, startups, products, and ideas for making companies.',
			},
			takes: {
				name: 'Takes',
				blurb: 'Opinions and hot takes on tools, code, and the industry.',
			},
			life: {
				name: 'Life',
				blurb: 'Personal experiences with software, existential detours, notes to future me.',
			},
			learning: {
				name: 'Learning',
				blurb: 'Studying in public — math, and the things I want to fill in.',
			},
		},
	},
	es: {
		metaTitle: 'La Bóveda',
		metaDescription:
			'Un archivo personal — ideas, guías prácticas y notas de mí para el yo del futuro.',
		title: 'La Bóveda',
		intro:
			'Un archivo personal. Mitad notas para el yo del futuro, mitad mostrar cómo se hacen las cosas: ideas sobre software, desvíos existenciales, alguna que otra guía práctica, y cualquier cosa que quiera poder releer más adelante.',
		empty: 'Todavía no hay nada acá. Volvé pronto.',
		navAria: 'Temas de la Bóveda',
		languageNote: 'Las entradas están escritas en inglés.',
		topics: {
			engineering: {
				name: 'Ingeniería',
				blurb: 'Arquitectura de software, guías prácticas, y cómo se construyen las cosas de verdad.',
			},
			building: {
				name: 'Construir',
				blurb: 'SaaS, startups, productos e ideas para armar empresas.',
			},
			takes: {
				name: 'Opiniones',
				blurb: 'Opiniones y posturas polémicas sobre herramientas, código y la industria.',
			},
			life: {
				name: 'Vida',
				blurb:
					'Experiencias personales con el software, desvíos existenciales, notas para el yo del futuro.',
			},
			learning: {
				name: 'Aprender',
				blurb: 'Estudiar en público — matemática, y las cosas que quiero completar.',
			},
		},
	},
};

/** Topic ids in display order — the order lives in `src/vault.ts`. */
export const topicOrder = VAULT_TOPIC_ORDER;
