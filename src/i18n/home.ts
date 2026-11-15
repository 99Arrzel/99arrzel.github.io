// Copy for the home page.
//
// Order on the page: the work first (hero, case studies, services, skills,
// contact), then the off-the-clock section with the meme wall and the life
// grid. The numbers in the hero and the case studies come from the CV seed
// (`src/scripts/cv/default-cv.ts`); change them there first.
//
// The meme wall is deliberately not translated: it is decoration, hidden from
// assistive tech, and the tiles are named after the memes themselves.

import type { Lang } from './index';

type Proof = { value: string; label: string };
type Case = { org: string; role: string; when: string; title: string; points: string[]; tags: string[] };
type Service = { title: string; body: string; tags: string[] };
type SkillGroup = { group: string; items: string[] };

type HomeCopy = {
	metaDescription: string;
	eyebrow: string;
	title: string;
	lede: string;
	availability: string;
	proof: Proof[];
	heroActions: { cv: string; linkedin: string; email: string };
	workTitle: string;
	workIntro: string;
	cases: Case[];
	workMore: string;
	servicesTitle: string;
	services: Service[];
	skillsTitle: string;
	skills: SkillGroup[];
	ctaTitle: string;
	ctaBody: string;
	ctaActions: { linkedin: string; email: string; cv: string; projects: string; github: string };
	funTitle: string;
	funIntro: string;
	wallAria: string;
	countdownLabel: string;
	units: { months: string; days: string; hours: string; minutes: string; seconds: string };
	countdownFoot: string;
	countdownAria: string;
};

export const home: Record<Lang, HomeCopy> = {
	en: {
		metaDescription:
			'Full-stack engineer for US SaaS teams: Stripe billing, legacy PHP to Next.js migrations, AWS pipelines and agentic AI workflows. Based in Buenos Aires.',
		eyebrow: 'Andrés Carrillo · Buenos Aires',
		title: 'Full-stack engineer for US SaaS teams.',
		lede: 'I ship production SaaS end to end: Stripe billing, legacy PHP → Next.js migrations, AWS pipelines. I also built the agentic AI workflow that took me from ~18 to ~100 merged PRs a month.',
		availability: 'Open to contract & full-time work · remote, overlapping US hours',
		proof: [
			{ value: '~5×', label: 'monthly merged PRs after building our agentic workflow' },
			{ value: '770', label: 'PRs merged at PostReminder, the most on a six-engineer team' },
			{ value: '1,000+', label: 'end-to-end tests unblocked by the seeder I built at FloQast' },
			{ value: '3+ yrs', label: 'shipping production web apps end to end' },
		],
		heroActions: { cv: 'Read my CV', linkedin: 'LinkedIn', email: 'Email me' },
		workTitle: 'Selected work',
		workIntro: 'What I did, and what changed because of it.',
		cases: [
			{
				org: 'PostReminder',
				role: 'Agentic AI Engineer · contract',
				when: 'Jul 2025 – present · Remote, San Francisco',
				title: 'Moved a legacy PHP product onto Next.js, and built the agentic workflow the team ships with',
				points: [
					'Migrated the PHP product to a Next.js 16 / React 19 / TypeScript monorepo (Turborepo + Bun), with one type system across web, API and shared packages.',
					'Designed the team’s agentic development workflow: parallel LLM agents in isolated git worktrees behind automated review gates. My merged PRs went from ~18 to ~100 a month; 770 in total, the most on the team.',
					'Own the AWS pipeline (GitHub Actions → ECR → ECS via CloudFormation) and the billing layer: RBAC plus plan-based entitlements on Stripe, with proration and webhook-driven sync.',
				],
				tags: ['Next.js', 'TypeScript', 'AWS ECS', 'CloudFormation', 'Stripe', 'LLM agents'],
			},
			{
				org: 'FloQast',
				role: 'SDET · contract · Close QE team',
				when: 'Jun – Oct 2026 · Remote',
				title: 'Made 1,000+ end-to-end tests runnable against a live environment',
				points: [
					'Built a declarative database seeder from a JSON spec, deriving its collections and shapes from the existing codebase.',
					'It stands up the accounts, MongoDB records, Dropbox and Box storage and Harness feature flags that each Playwright and Selenium suite needs.',
					'Drove the suites to green across environments and documented the seeder for the wider team.',
				],
				tags: ['Playwright', 'Selenium', 'MongoDB', 'Test infrastructure'],
			},
			{
				org: 'Apotheca',
				role: 'Frontend Web Developer · contract',
				when: 'May 2025 – Feb 2026 · Remote',
				title: 'Cut about 1 MB from a headless storefront',
				points: [
					'Ran the Next.js server behind a headless BigCommerce store.',
					'Modelled Prismic content types and moved a large share of the page into data fetching, cutting roughly 1 MB of page weight.',
					'Rebuilt the cart on a Zustand store, replacing a large in-context implementation.',
				],
				tags: ['Next.js', 'BigCommerce', 'Prismic', 'Zustand'],
			},
			{
				org: 'Gometrixs',
				role: 'Full Stack Engineer',
				when: 'Jun 2024 – Apr 2025 · Santa Cruz, Bolivia',
				title: 'Led a greenfield property management system',
				points: [
					'Owned architecture and delivery of Trippin, a new property management system (PMS).',
					'Coordinated a small team: coding standards, code reviews, onboarding.',
					'Migrated the codebase from JavaScript to TypeScript and fixed accounting and reporting in the company ERP.',
				],
				tags: ['TypeScript', 'Team lead', 'ERP'],
			},
		],
		workMore: 'Full history in my CV',
		servicesTitle: 'How I can help',
		services: [
			{
				title: 'Production SaaS, end-to-end',
				body: 'Greenfield Next.js / TypeScript apps with auth, billing, and an AWS deploy pipeline you can hand off. I build the whole stack — frontend, API, database, infra, payments — so you ship instead of stitching.',
				tags: ['Next.js', 'TypeScript', 'Prisma', 'AWS ECS', 'Stripe'],
			},
			{
				title: 'Legacy modernization',
				body: 'Migrate an old PHP or Laravel product onto a modern stack without breaking what works. I just did this at PostReminder — PHP to a Next.js 16 / React 19 monorepo with a unified type system and a real CI/CD pipeline.',
				tags: ['PHP → Next.js', 'Monorepos', 'Turborepo + Bun', 'CloudFormation'],
			},
			{
				title: 'Stripe billing & access control',
				body: 'Subscriptions, proration, webhooks, plan-based feature gating, RBAC with granular permissions and per-workspace overrides. The boring stuff that breaks customer trust when it goes wrong.',
				tags: ['Stripe', 'RBAC', 'Entitlements', 'Webhooks'],
			},
			{
				title: 'E-commerce storefronts',
				body: 'Headless commerce on Next.js with BigCommerce or similar, plus a headless CMS (Prismic) so your content team can ship without engineering. Performance and checkout reliability included.',
				tags: ['Next.js', 'BigCommerce', 'Prismic', 'Headless CMS'],
			},
			{
				title: 'LLM-augmented engineering',
				body: 'Multi-agent workflows (isolated git worktrees, skill-based agents, automated review) so a small team can ship at the cadence of a much larger one. I use this every day; I can help your team adopt it.',
				tags: ['LLM workflows', 'Claude Code', 'Automation'],
			},
		],
		skillsTitle: 'Full skill inventory',
		skills: [
			{ group: 'Languages', items: ['TypeScript', 'JavaScript', 'PHP', 'Python', 'Rust', 'Go'] },
			{ group: 'Frontend', items: ['React', 'Next.js', 'Vue.js', 'Tailwind CSS', 'HTML5', 'CSS3'] },
			{ group: 'Backend', items: ['Node.js', 'Laravel', 'REST APIs', 'Spring Boot (intro)'] },
			{ group: 'Databases', items: ['MySQL', 'PostgreSQL', 'MongoDB', 'Prisma ORM', 'Relational design'] },
			{
				group: 'Testing',
				items: ['Playwright', 'Selenium', 'End-to-end test infrastructure', 'Test-data seeding'],
			},
			{
				group: 'Infrastructure / DevOps',
				items: [
					'AWS (ECS, ECR)',
					'CloudFormation',
					'GitHub Actions',
					'CI/CD',
					'Docker',
					'Bun',
					'Turborepo',
				],
			},
			{
				group: 'Payments / Auth',
				items: [
					'Stripe subscriptions',
					'Stripe webhooks',
					'Proration',
					'RBAC',
					'Plan-based entitlements',
				],
			},
			{ group: 'E-commerce / CMS', items: ['BigCommerce', 'Prismic'] },
			{
				group: 'Mobile / Embedded',
				items: ['React Native', 'Flutter', 'Arduino', 'ESP32', 'Raspberry Pi'],
			},
			{
				group: 'Workflow',
				items: [
					'Git',
					'Teamwork',
					'LLM-augmented engineering',
					'Multi-agent worktrees',
					'Automated review',
				],
			},
		],
		ctaTitle: "Let's work together",
		ctaBody:
			'Looking for help on a project, a freelance engagement, or a full-time role? The fastest way to reach me is a DM on LinkedIn.',
		ctaActions: {
			linkedin: 'Message me on LinkedIn',
			email: 'Email me',
			cv: 'Read my CV',
			projects: 'Browse my projects',
			github: 'Code on GitHub',
		},
		funTitle: 'Off the clock',
		funIntro:
			'That was the work. This is the rest: a wall of sad LATAM memes, a countdown to New Year, and my life in weeks.',
		wallAria: 'Time is running out',
		countdownLabel: 'Time left this year',
		units: {
			months: 'months',
			days: 'days',
			hours: 'hours',
			minutes: 'minutes',
			seconds: 'seconds',
		},
		countdownFoot: 'Memento mori. Build the thing.',
		countdownAria: 'Time remaining this year',
	},
	es: {
		metaDescription:
			'Ingeniero full-stack para equipos SaaS de EE. UU.: cobros con Stripe, migraciones de PHP a Next.js, pipelines en AWS y flujos de IA agéntica. Desde Buenos Aires.',
		eyebrow: 'Andrés Carrillo · Buenos Aires',
		title: 'Ingeniero full-stack para equipos SaaS de EE. UU.',
		lede: 'Lanzo SaaS en producción de punta a punta: cobros con Stripe, migraciones de PHP heredado a Next.js, pipelines en AWS. También armé el flujo de IA agéntica que me llevó de ~18 a ~100 PRs mergeados por mes.',
		availability: 'Abierto a contrato y jornada completa · remoto, en horario de EE. UU.',
		proof: [
			{ value: '~5×', label: 'PRs mergeados por mes después de armar nuestro flujo agéntico' },
			{ value: '770', label: 'PRs mergeados en PostReminder, la mayor cantidad de un equipo de seis' },
			{ value: '1.000+', label: 'pruebas end-to-end destrabadas por el seeder que construí en FloQast' },
			{ value: '3+ años', label: 'lanzando aplicaciones web en producción de punta a punta' },
		],
		heroActions: { cv: 'Leer mi CV', linkedin: 'LinkedIn', email: 'Escribime un mail' },
		workTitle: 'Trabajo destacado',
		workIntro: 'Qué hice, y qué cambió gracias a eso.',
		cases: [
			{
				org: 'PostReminder',
				role: 'Agentic AI Engineer · contrato',
				when: 'jul 2025 – presente · Remoto, San Francisco',
				title: 'Llevé un producto PHP heredado a Next.js, y armé el flujo agéntico con el que entrega el equipo',
				points: [
					'Migré el producto PHP a un monorepo Next.js 16 / React 19 / TypeScript (Turborepo + Bun), con un solo sistema de tipos para web, API y paquetes compartidos.',
					'Diseñé el flujo de desarrollo agéntico del equipo: agentes LLM en paralelo, en worktrees de git aislados, detrás de revisiones automáticas. Mis PRs mergeados pasaron de ~18 a ~100 por mes; 770 en total, la mayor cantidad del equipo.',
					'Me hago cargo del pipeline en AWS (GitHub Actions → ECR → ECS con CloudFormation) y de la capa de cobros: RBAC más permisos por plan sobre Stripe, con prorrateo y sincronización por webhooks.',
				],
				tags: ['Next.js', 'TypeScript', 'AWS ECS', 'CloudFormation', 'Stripe', 'Agentes LLM'],
			},
			{
				org: 'FloQast',
				role: 'SDET · contrato · equipo Close QE',
				when: 'jun – oct 2026 · Remoto',
				title: 'Hice que más de 1.000 pruebas end-to-end corrieran contra un entorno real',
				points: [
					'Construí un seeder declarativo de base de datos a partir de una especificación JSON, derivando colecciones y formas del código existente.',
					'Levanta las cuentas, los registros de MongoDB, el almacenamiento en Dropbox y Box y los feature flags de Harness que necesita cada suite de Playwright y Selenium.',
					'Llevé las suites a verde en varios entornos y documenté el seeder para el resto del equipo.',
				],
				tags: ['Playwright', 'Selenium', 'MongoDB', 'Infraestructura de pruebas'],
			},
			{
				org: 'Apotheca',
				role: 'Frontend Web Developer · contrato',
				when: 'may 2025 – feb 2026 · Remoto',
				title: 'Le saqué cerca de 1 MB a una tienda headless',
				points: [
					'Mantuve el servidor Next.js detrás de una tienda BigCommerce headless.',
					'Modelé los tipos de contenido de Prismic y pasé buena parte de la página a data fetching, recortando cerca de 1 MB de peso.',
					'Rehice el carrito sobre un store de Zustand, reemplazando una implementación grande basada en contexto.',
				],
				tags: ['Next.js', 'BigCommerce', 'Prismic', 'Zustand'],
			},
			{
				org: 'Gometrixs',
				role: 'Full Stack Engineer',
				when: 'jun 2024 – abr 2025 · Santa Cruz, Bolivia',
				title: 'Lideré un sistema de gestión hotelera desde cero',
				points: [
					'Me hice cargo de la arquitectura y la entrega de Trippin, un sistema de gestión de propiedades (PMS) nuevo.',
					'Coordiné un equipo chico: estándares de código, code reviews, incorporación de gente nueva.',
					'Migré el código de JavaScript a TypeScript y arreglé contabilidad y reportes en el ERP de la empresa.',
				],
				tags: ['TypeScript', 'Liderazgo técnico', 'ERP'],
			},
		],
		workMore: 'Historial completo en mi CV',
		servicesTitle: 'En qué te puedo ayudar',
		services: [
			{
				title: 'SaaS en producción, de punta a punta',
				body: 'Aplicaciones Next.js / TypeScript desde cero, con autenticación, cobros y un pipeline de despliegue en AWS que podés recibir y mantener. Construyo el stack completo — frontend, API, base de datos, infraestructura, pagos — para que lances en vez de andar pegando piezas.',
				tags: ['Next.js', 'TypeScript', 'Prisma', 'AWS ECS', 'Stripe'],
			},
			{
				title: 'Modernización de sistemas heredados',
				body: 'Migrar un producto viejo en PHP o Laravel a un stack moderno sin romper lo que ya funciona. Lo acabo de hacer en PostReminder — de PHP a un monorepo Next.js 16 / React 19, con un sistema de tipos unificado y un pipeline de CI/CD de verdad.',
				tags: ['PHP → Next.js', 'Monorepos', 'Turborepo + Bun', 'CloudFormation'],
			},
			{
				title: 'Cobros con Stripe y control de acceso',
				body: 'Suscripciones, prorrateo, webhooks, funcionalidades habilitadas según el plan, RBAC con permisos granulares y excepciones por espacio de trabajo. Lo aburrido, que es justo lo que rompe la confianza del cliente cuando falla.',
				tags: ['Stripe', 'RBAC', 'Permisos por plan', 'Webhooks'],
			},
			{
				title: 'Tiendas de e-commerce',
				body: 'Comercio headless sobre Next.js con BigCommerce o similar, más un CMS headless (Prismic) para que tu equipo de contenido publique sin depender de ingeniería. Rendimiento y fiabilidad del checkout incluidos.',
				tags: ['Next.js', 'BigCommerce', 'Prismic', 'CMS headless'],
			},
			{
				title: 'Ingeniería potenciada con LLMs',
				body: 'Flujos de trabajo multi-agente (worktrees de git aislados, agentes especializados, revisión automatizada) para que un equipo chico entregue al ritmo de uno mucho más grande. Lo uso todos los días; puedo ayudar a tu equipo a adoptarlo.',
				tags: ['Flujos con LLMs', 'Claude Code', 'Automatización'],
			},
		],
		skillsTitle: 'Inventario completo de habilidades',
		skills: [
			{ group: 'Lenguajes', items: ['TypeScript', 'JavaScript', 'PHP', 'Python', 'Rust', 'Go'] },
			{ group: 'Frontend', items: ['React', 'Next.js', 'Vue.js', 'Tailwind CSS', 'HTML5', 'CSS3'] },
			{ group: 'Backend', items: ['Node.js', 'Laravel', 'APIs REST', 'Spring Boot (intro)'] },
			{ group: 'Bases de datos', items: ['MySQL', 'PostgreSQL', 'MongoDB', 'Prisma ORM', 'Diseño relacional'] },
			{
				group: 'Testing',
				items: ['Playwright', 'Selenium', 'Infraestructura de pruebas end-to-end', 'Seeding de datos de prueba'],
			},
			{
				group: 'Infraestructura / DevOps',
				items: [
					'AWS (ECS, ECR)',
					'CloudFormation',
					'GitHub Actions',
					'CI/CD',
					'Docker',
					'Bun',
					'Turborepo',
				],
			},
			{
				group: 'Pagos / Autenticación',
				items: [
					'Suscripciones con Stripe',
					'Webhooks de Stripe',
					'Prorrateo',
					'RBAC',
					'Permisos según el plan',
				],
			},
			{ group: 'E-commerce / CMS', items: ['BigCommerce', 'Prismic'] },
			{
				group: 'Móvil / Embebidos',
				items: ['React Native', 'Flutter', 'Arduino', 'ESP32', 'Raspberry Pi'],
			},
			{
				group: 'Forma de trabajo',
				items: [
					'Git',
					'Trabajo en equipo',
					'Ingeniería potenciada con LLMs',
					'Worktrees multi-agente',
					'Revisión automatizada',
				],
			},
		],
		ctaTitle: 'Trabajemos juntos',
		ctaBody:
			'¿Buscás ayuda con un proyecto, una colaboración freelance o alguien a tiempo completo? Lo más rápido es escribirme por LinkedIn.',
		ctaActions: {
			linkedin: 'Escribime por LinkedIn',
			email: 'Escribime un mail',
			cv: 'Leer mi CV',
			projects: 'Ver mis proyectos',
			github: 'Código en GitHub',
		},
		funTitle: 'Fuera de horario',
		funIntro:
			'Eso fue el trabajo. Esto es el resto: una pared de memes tristes latinoamericanos, la cuenta regresiva a Año Nuevo y mi vida en semanas.',
		wallAria: 'Se está acabando el tiempo',
		countdownLabel: 'Lo que queda del año',
		units: {
			months: 'meses',
			days: 'días',
			hours: 'horas',
			minutes: 'minutos',
			seconds: 'segundos',
		},
		countdownFoot: 'Memento mori. Construí la cosa.',
		countdownAria: 'Tiempo restante de este año',
	},
};
