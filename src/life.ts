// Milestones pinned to my life grid on the home page.
//
// Each one lights up the squares its date covers, and clicking one of them
// shows the story. `goal: true` marks something I want to have done by then
// rather than something that already happened. They only show on my grid: a
// visitor who types in their own birthday gets a clean one.

import type { Lang } from './i18n';

export type Milestone = {
	/**
	 * As precise as I actually know it, and no more: `YYYY-MM-DD` marks its
	 * square, `YYYY-MM` the first week of that month (labelled with just the
	 * month), and `YYYY` tints the whole year. Don't round a year up to January 1st: that's New Year's Day.
	 */
	date: string;
	/**
	 * For a job or a degree: when it ended, at the same kinds of precision as
	 * `date`, or `'present'`. Every week from `date` to here is coloured in, so
	 * the stretches between start dates don't read as time off.
	 */
	until?: string;
	/** What the `until` stretch was. Jobs are the default. */
	kind?: 'work' | 'study';
	goal?: boolean;
	title: Record<Lang, string>;
	body?: Record<Lang, string>;
};

export const milestones: Milestone[] = [
	{
		date: '1999-10-31',
		title: { en: 'Born', es: 'Nací' },
	},
	// Career and study, from the CV, at the precision it gives.
	{
		date: '2018',
		until: '2019',
		kind: 'study',
		title: { en: 'Computer Science at UBA', es: 'Ciencias de la Computación en la UBA' },
		body: { en: 'University of Buenos Aires, 2018–2019.', es: 'Universidad de Buenos Aires, 2018–2019.' },
	},
	{
		date: '2020',
		until: '2024',
		kind: 'study',
		title: { en: 'Systems Engineering at Franz Tamayo', es: 'Ingeniería de Sistemas en la Franz Tamayo' },
		body: {
			en: 'Universidad Franz Tamayo, 2020–2024. Coursework complete, thesis pending.',
			es: 'Universidad Franz Tamayo, 2020–2024. Cursada completa, tesis pendiente.',
		},
	},
	{
		date: '2023-02',
		until: '2023-07',
		title: { en: 'Freelance full-stack work', es: 'Trabajo full-stack freelance' },
		body: {
			en: 'Full-stack projects in Laravel and Vue for a range of clients.',
			es: 'Proyectos full-stack en Laravel y Vue para distintos clientes.',
		},
	},
	{
		date: '2023-09',
		until: '2024-04',
		title: { en: 'Full Stack Engineer at Viacon Tours', es: 'Full Stack Engineer en Viacon Tours' },
		body: {
			en: "On-site in Santa Cruz, Bolivia. Helped build the company's internal ERP on Laravel microservices.",
			es: 'Presencial en Santa Cruz, Bolivia. Ayudé a construir el ERP interno de la empresa sobre microservicios en Laravel.',
		},
	},
	{
		date: '2024-06',
		until: '2025-04',
		title: { en: 'Full Stack Engineer at Gometrixs', es: 'Full Stack Engineer en Gometrixs' },
		body: {
			en: 'On-site in Santa Cruz, Bolivia. Led development of Trippin, a greenfield property management system.',
			es: 'Presencial en Santa Cruz, Bolivia. Lideré el desarrollo de Trippin, un sistema de gestión de propiedades desde cero.',
		},
	},
	{
		date: '2025-05',
		until: '2026-02',
		title: { en: 'Frontend Web Developer at Apotheca', es: 'Frontend Web Developer en Apotheca' },
		body: {
			en: 'Remote contract. A Next.js storefront on headless BigCommerce and Prismic.',
			es: 'Contrato remoto. Una tienda en Next.js sobre BigCommerce headless y Prismic.',
		},
	},
	{
		date: '2025-07',
		until: 'present',
		title: { en: 'Agentic AI Engineer at PostReminder', es: 'Agentic AI Engineer en PostReminder' },
		body: {
			en: 'Remote, for a San Francisco company. Moved a legacy PHP product onto a Next.js monorepo and built the team’s agentic development workflow.',
			es: 'Remoto, para una empresa de San Francisco. Migré un producto PHP heredado a un monorepo Next.js y armé el flujo de desarrollo agéntico del equipo.',
		},
	},
	{
		date: '2026-06',
		until: '2026-10',
		title: { en: 'SDET at FloQast', es: 'SDET en FloQast' },
		body: {
			en: 'Remote contract on the Close QE team. Built the data seeder that lets 1,000+ end-to-end tests run against a live environment.',
			es: 'Contrato remoto en el equipo de Close QE. Construí el seeder de datos que permite correr más de 1.000 tests end-to-end contra un entorno real.',
		},
	},
	// Goals.
	{
		date: '2029-10-31',
		goal: true,
		title: { en: 'See Patagonia', es: 'Conocer la Patagonia' },
		body: {
			en: 'Torres del Paine, or the Argentine side. Before I turn 30.',
			es: 'Torres del Paine, o el lado argentino. Antes de cumplir 30.',
		},
	},
];
