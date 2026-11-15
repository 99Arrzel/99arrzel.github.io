// Copy for the read-only CV page (`/resume`).
//
// The CV itself is not here: the page renders the CV Press seed document
// (`src/scripts/cv/default-cv.ts`) at build time, so the builder, the About
// page and this page all read the same career history.

import type { Lang } from './index';

type ResumeCopy = {
	metaTitle: string;
	metaDescription: string;
	title: string;
	download: string;
	downloadHint: string;
	contact: string;
	builder: string;
};

export const resume: Record<Lang, ResumeCopy> = {
	en: {
		metaTitle: 'CV',
		metaDescription:
			'CV of Andrés Carrillo: full-stack engineer for US SaaS teams. Next.js, TypeScript, AWS, Stripe and agentic AI workflows.',
		title: 'Curriculum vitae',
		download: 'Download PDF',
		downloadHint: 'Opens the print dialog. Pick "Save as PDF".',
		contact: 'Message me on LinkedIn',
		builder: 'Make your own in CV Press',
	},
	es: {
		metaTitle: 'CV',
		metaDescription:
			'CV de Andrés Carrillo: ingeniero full-stack para equipos SaaS de EE. UU. Next.js, TypeScript, AWS, Stripe y flujos de IA agéntica.',
		title: 'Curriculum vitae',
		download: 'Descargar PDF',
		downloadHint: 'Abre el diálogo de impresión. Elegí "Guardar como PDF".',
		contact: 'Escribime por LinkedIn',
		builder: 'Armá el tuyo en CV Press',
	},
};
