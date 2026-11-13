// Copy for the 404 page.
//
// Unlike every other page there is only one built file: GitHub Pages serves
// `404.html` for any missing URL, `/es/...` included. So the page carries both
// languages and shows the one the dead URL was asking for.

import type { Lang } from './index';

type NotFoundCopy = {
	metaTitle: string;
	metaDescription: string;
	title: string;
	body: string;
	home: string;
	projects: string;
	vault: string;
};

export const notFound: Record<Lang, NotFoundCopy> = {
	en: {
		metaTitle: 'Page not found',
		metaDescription: 'This page does not exist.',
		title: 'This page ran out of time.',
		body: 'Whatever was here is gone, or never existed. The rest of the site is still counting down.',
		home: 'Back home',
		projects: 'Projects',
		vault: 'The Vault',
	},
	es: {
		metaTitle: 'Página no encontrada',
		metaDescription: 'Esta página no existe.',
		title: 'A esta página se le acabó el tiempo.',
		body: 'Lo que había acá ya no está, o nunca existió. El resto del sitio sigue en cuenta regresiva.',
		home: 'Volver al inicio',
		projects: 'Proyectos',
		vault: 'La Bóveda',
	},
};
