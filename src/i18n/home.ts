// Copy for the home page.
//
// The meme wall is deliberately not translated: it is decoration, hidden from
// assistive tech, and the tiles are named after the memes themselves.

import type { Lang } from './index';

type Service = { title: string; body: string; tags: string[] };
type SkillGroup = { group: string; items: string[] };

type HomeCopy = {
	metaDescription: string;
	introHtml: string;
	countdownLabel: string;
	units: { months: string; days: string; hours: string; minutes: string; seconds: string };
	countdownFoot: string;
	countdownAria: string;
	wallAria: string;
	availability: string;
	scrollHint: string;
	servicesTitle: string;
	services: Service[];
	skillsTitle: string;
	skills: SkillGroup[];
	ctaTitle: string;
	ctaBody: string;
	ctaActions: { linkedin: string; projects: string; cv: string; github: string };
};

export const home: Record<Lang, HomeCopy> = {
	en: {
		metaDescription:
			'Full-stack engineer in Buenos Aires. I build production SaaS and automate annoying things.',
		introHtml: `Hey, I'm <strong>Andres</strong> &middot; full-stack engineer in Buenos Aires`,
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
		wallAria: 'Time is running out',
		availability: 'Open to freelance & full-time work · remote globally',
		scrollHint: 'Scroll for the boring stuff',
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
			projects: 'Browse my projects',
			cv: 'Read my CV',
			github: 'Code on GitHub',
		},
	},
	es: {
		metaDescription:
			'Ingeniero full-stack en Buenos Aires. Construyo SaaS en producción y automatizo cosas molestas.',
		introHtml: `Hola, soy <strong>Andres</strong> &middot; ingeniero full-stack en Buenos Aires`,
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
		wallAria: 'Se está acabando el tiempo',
		// Kept to roughly the English length: the badge is a pill over a busy
		// background, and a longer line pushes it into the wrapping that turns it
		// into a blob on narrow screens.
		availability: 'Abierto a freelance y jornada completa · remoto global',
		scrollHint: 'Bajá para la parte aburrida',
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
			projects: 'Ver mis proyectos',
			cv: 'Leer mi CV',
			github: 'Código en GitHub',
		},
	},
};
