// Copy for the About page.
//
// Values ending in `Html` carry inline markup (links, <em>) and are rendered
// with set:html; everything else is plain text. Keeping the two apart means a
// translator can see at a glance which strings have tags to preserve.
//
// The jobs and degrees are not here: the page reads them out of the CV seed
// (`src/scripts/cv/default-cv.ts`), so there is one career history to keep up
// to date rather than two that drift.

import type { Lang } from './index';

type AboutCopy = {
	metaTitle: string;
	metaDescription: string;
	title: string;
	/** Names the menu of sections. */
	menuLabel: string;
	/** Heading of the opening section, and its name in the menu. */
	introTitle: string;
	introHtml: string[];
	experienceTitle: string;
	educationTitle: string;
	/** Menu heading over the sections that come after the jobs. */
	moreTitle: string;
	contactTitle: string;
	contactHtml: string[];
};

export const about: Record<Lang, AboutCopy> = {
	en: {
		metaTitle: 'About',
		metaDescription: 'About Andres Carrillo - full-stack engineer based in Buenos Aires',
		title: 'About me',
		menuLabel: 'Sections',
		introTitle: 'In short',
		introHtml: [
			`I'm a full-stack engineer based in Buenos Aires, originally from Santa Cruz, Bolivia.
			 I've spent the last 3+ years shipping production web apps end-to-end &mdash; currently at
			 PostReminder, where I migrated a legacy PHP system to a Next.js 16 / React 19 / TypeScript
			 monorepo, own the AWS ECS deploy pipeline (CloudFormation + GitHub Actions), and built the
			 Stripe-based subscriptions and RBAC layer.`,
			`I work comfortably across the stack &mdash; frontend (React, Next.js, drag-and-drop,
			 virtualization, theming), backend (Node, TypeScript, Prisma, Laravel, PHP), infrastructure
			 (AWS, GitHub Actions, CloudFormation), and payments/auth (Stripe, RBAC). I also run
			 multi-agent LLM workflows (isolated worktrees, automated review) to ship faster without
			 losing rigor.`,
			`Outside of work I like building practical things. Most of my side projects come from real
			 problems: a bank that doesn't offer a QR payment API (so I automated it via ADB),
			 marketplace listings with no prices (so I built a marketplace where prices are mandatory),
			 manual attendance tracking (so I built a barcode-scanning system).`,
		],
		experienceTitle: 'Experience',
		educationTitle: 'Education',
		moreTitle: 'And also',
		contactTitle: 'Get in touch',
		contactHtml: [
			`Find me on <a href="https://github.com/99arrzel" target="_blank">GitHub</a>
			 or <a href="https://linkedin.com/in/99arrzel" target="_blank">LinkedIn</a>.`,
			`Everything above is also on <a href="{cv}">my CV</a> &mdash; built with, and readable in,
			 the <a href="{cv}">CV&nbsp;Press</a> builder I wrote for this site. It runs entirely in your
			 browser, so you can load it up, overwrite it with your own details, and print your own.`,
		],
	},
	es: {
		metaTitle: 'Sobre mí',
		metaDescription: 'Sobre Andres Carrillo — ingeniero full-stack radicado en Buenos Aires',
		title: 'Sobre mí',
		menuLabel: 'Secciones',
		introTitle: 'En resumen',
		introHtml: [
			`Soy ingeniero full-stack radicado en Buenos Aires, originario de Santa Cruz, Bolivia.
			 Pasé los últimos 3+ años lanzando aplicaciones web de punta a punta en producción &mdash;
			 actualmente en PostReminder, donde migré un sistema PHP heredado a un monorepo
			 Next.js 16 / React 19 / TypeScript, me hago cargo del pipeline de despliegue en AWS ECS
			 (CloudFormation + GitHub Actions), y construí la capa de suscripciones con Stripe y RBAC.`,
			`Me muevo con comodidad por todo el stack &mdash; frontend (React, Next.js, drag-and-drop,
			 virtualización, theming), backend (Node, TypeScript, Prisma, Laravel, PHP), infraestructura
			 (AWS, GitHub Actions, CloudFormation) y pagos/autenticación (Stripe, RBAC). También uso
			 flujos de trabajo multi-agente con LLMs (worktrees aislados, revisión automatizada) para
			 entregar más rápido sin perder rigor.`,
			`Fuera del trabajo me gusta construir cosas prácticas. Casi todos mis proyectos personales
			 salen de problemas reales: un banco que no ofrece API de pagos por QR (así que lo automaticé
			 con ADB), publicaciones de marketplace sin precio (así que armé un marketplace donde el
			 precio es obligatorio), control de asistencia a mano (así que hice un sistema con escaneo
			 de códigos de barras).`,
		],
		experienceTitle: 'Experiencia',
		educationTitle: 'Formación',
		moreTitle: 'Y además',
		contactTitle: 'Contacto',
		contactHtml: [
			`Me encontrás en <a href="https://github.com/99arrzel" target="_blank">GitHub</a>
			 o en <a href="https://linkedin.com/in/99arrzel" target="_blank">LinkedIn</a>.`,
			`Todo lo de arriba está también en <a href="{cv}">mi CV</a> &mdash; hecho con, y legible en,
			 el editor <a href="{cv}">CV&nbsp;Press</a> que escribí para este sitio. Corre entero en tu
			 navegador, así que podés abrirlo, reemplazar mis datos por los tuyos e imprimir el tuyo.`,
		],
	},
};
