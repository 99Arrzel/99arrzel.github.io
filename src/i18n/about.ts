// Copy for the About page.
//
// Values ending in `Html` carry inline markup (links, <em>) and are rendered
// with set:html; everything else is plain text. Keeping the two apart means a
// translator can see at a glance which strings have tags to preserve.

import type { Lang } from './index';

type Job = {
	role: string;
	company: string;
	place: string;
	period: string;
	bodyHtml: string;
};

type AboutCopy = {
	metaTitle: string;
	metaDescription: string;
	title: string;
	introHtml: string[];
	experienceTitle: string;
	jobs: Job[];
	educationTitle: string;
	educationHtml: string[];
	contactTitle: string;
	contactHtml: string[];
};

export const about: Record<Lang, AboutCopy> = {
	en: {
		metaTitle: 'About',
		metaDescription: 'About Andres Carrillo - full-stack engineer based in Buenos Aires',
		title: 'About me',
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
		jobs: [
			{
				role: 'Full Stack Engineer',
				company: 'PostReminder',
				place: 'Remote (San Francisco, CA)',
				period: 'Jul 2025 — Present',
				bodyHtml: `Migrated a legacy PHP product to a Next.js 16 / React 19 / TypeScript monorepo
					(Turborepo + Bun). Designed the AWS deployment pipeline (GitHub Actions &rarr; ECR
					&rarr; ECS via CloudFormation). Own MySQL/Prisma schema and migrations. Built a
					two-layer authorization system combining RBAC with plan-based entitlements,
					synced via Stripe checkout, proration, and webhooks. Authored security and
					compliance documentation for the team.`,
			},
			{
				role: 'Frontend Web Developer',
				company: 'Alvind',
				place: 'Hybrid (Santa Cruz, Bolivia)',
				period: 'May 2025 — Feb 2026 (Part-time)',
				bodyHtml: `Maintained and shipped features for an e-commerce storefront on Next.js,
					integrated with BigCommerce for catalog/checkout and Prismic for headless content.
					Improved storefront performance across product, cart, and checkout flows.`,
			},
			{
				role: 'Full Stack Engineer',
				company: 'Gometrixs',
				place: 'On-site (Santa Cruz, Bolivia)',
				period: 'Jun 2024 — Apr 2025',
				bodyHtml: `Tech-led <em>Trippin</em>, a new product spun out of Viacon &mdash; owned architecture
					decisions and end-to-end delivery across frontend and backend. Coordinated a small
					team, defined coding standards, ran code reviews, and onboarded contributors.`,
			},
			{
				role: 'Full Stack Engineer',
				company: 'Viacon Tours',
				place: 'On-site (Santa Cruz, Bolivia)',
				period: 'Sep 2023 — Apr 2024',
				bodyHtml: `Built and maintained internal tools and customer-facing features for a tour
					operator using PHP, React, and MySQL. Introduced engineering standards and
					mentored peers as the team modernized parts of the stack toward AWS, Next.js,
					and Laravel.`,
			},
			{
				role: 'Full Stack Engineer',
				company: 'Freelance',
				place: 'Remote',
				period: 'Feb 2023 — Jul 2023',
				bodyHtml: `Built full-stack projects in Laravel + Vue for various clients; first hands-on
					exposure to Spring Boot architecture.`,
			},
		],
		educationTitle: 'Education',
		educationHtml: [
			`<strong>Universidad Franz Tamayo</strong> &middot; Systems Engineering &middot; 2020&ndash;2024 <em>(coursework complete, thesis pending)</em>`,
			`<strong>University of Buenos Aires (UBA)</strong> &middot; Computer Science, Exactas &middot; 2018&ndash;2019`,
		],
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
		jobs: [
			{
				role: 'Ingeniero Full Stack',
				company: 'PostReminder',
				place: 'Remoto (San Francisco, CA)',
				period: 'Jul 2025 — Presente',
				bodyHtml: `Migré un producto PHP heredado a un monorepo Next.js 16 / React 19 / TypeScript
					(Turborepo + Bun). Diseñé el pipeline de despliegue en AWS (GitHub Actions &rarr; ECR
					&rarr; ECS vía CloudFormation). Me hago cargo del esquema y las migraciones de
					MySQL/Prisma. Construí un sistema de autorización de dos capas que combina RBAC con
					permisos según el plan contratado, sincronizados vía checkout, prorrateo y webhooks de
					Stripe. Escribí la documentación de seguridad y cumplimiento del equipo.`,
			},
			{
				role: 'Desarrollador Web Frontend',
				company: 'Alvind',
				place: 'Híbrido (Santa Cruz, Bolivia)',
				period: 'May 2025 — Feb 2026 (Medio tiempo)',
				bodyHtml: `Mantuve y lancé funcionalidades para una tienda de e-commerce en Next.js,
					integrada con BigCommerce para catálogo y checkout, y con Prismic como CMS headless.
					Mejoré el rendimiento de la tienda en los flujos de producto, carrito y checkout.`,
			},
			{
				role: 'Ingeniero Full Stack',
				company: 'Gometrixs',
				place: 'Presencial (Santa Cruz, Bolivia)',
				period: 'Jun 2024 — Abr 2025',
				bodyHtml: `Lideré técnicamente <em>Trippin</em>, un producto nuevo desprendido de Viacon &mdash;
					a cargo de las decisiones de arquitectura y de la entrega de punta a punta, tanto en
					frontend como en backend. Coordiné un equipo chico, definí los estándares de código,
					hice revisiones e incorporé a nuevos colaboradores.`,
			},
			{
				role: 'Ingeniero Full Stack',
				company: 'Viacon Tours',
				place: 'Presencial (Santa Cruz, Bolivia)',
				period: 'Sep 2023 — Abr 2024',
				bodyHtml: `Construí y mantuve herramientas internas y funcionalidades de cara al cliente para
					un operador turístico, con PHP, React y MySQL. Introduje estándares de ingeniería y
					acompañé a mis compañeros mientras el equipo modernizaba parte del stack hacia AWS,
					Next.js y Laravel.`,
			},
			{
				role: 'Ingeniero Full Stack',
				company: 'Freelance',
				place: 'Remoto',
				period: 'Feb 2023 — Jul 2023',
				bodyHtml: `Construí proyectos full-stack en Laravel + Vue para distintos clientes; mi primer
					contacto práctico con la arquitectura de Spring Boot.`,
			},
		],
		educationTitle: 'Formación',
		educationHtml: [
			`<strong>Universidad Franz Tamayo</strong> &middot; Ingeniería de Sistemas &middot; 2020&ndash;2024 <em>(materias completas, tesis pendiente)</em>`,
			`<strong>Universidad de Buenos Aires (UBA)</strong> &middot; Ciencias de la Computación, Exactas &middot; 2018&ndash;2019`,
		],
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
