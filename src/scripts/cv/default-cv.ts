// The document a first-time visitor lands on. It's my own CV, which makes the
// tool self-demonstrating: every feature is visible against real content
// instead of lorem, and "clear and start yours" is one button away.

export const DEFAULT_CV = `---
name: Andrés Carrillo Zelada
title: Full-Stack Agentic Engineer · Next.js / TypeScript / AWS
location: Buenos Aires, Argentina
email: af.carrillo@live.com
links:
  - linkedin.com/in/99arrzel
  - github.com/99Arrzel
extra: Spanish (native) · English C1 — EF SET · Open to remote globally
template: broadsheet
page: Letter
density: tight
accent: #2f62c8
rail:
  - Technical Skills
  - Education
---

## Professional Summary

Full-stack engineer with 3+ years shipping production web apps end-to-end, working on contract for US SaaS teams. Most recently SDET at FloQast, where I built a declarative database seeder that unblocked more than 1,000 Playwright and Selenium end-to-end tests. At PostReminder I migrated a legacy PHP product to a Next.js 16 / React 19 / TypeScript monorepo, own the AWS ECS deployment pipeline, and built Stripe subscriptions behind RBAC and plan-based entitlements. I work across frontend, backend, infrastructure and test tooling, and run agentic LLM workflows that lifted my delivery throughput roughly fivefold.

## Technical Skills

**Languages:** TypeScript, JavaScript, PHP, Python
**Frontend:** React, Next.js, Vue, Zustand, Tailwind CSS
**Backend & Data:** Node.js, Laravel, REST APIs, Prisma, MySQL, PostgreSQL, MongoDB
**Testing:** Playwright, Selenium, quality engineering (QE), end-to-end test infrastructure, declarative test-data seeding, Harness feature flags
**Infrastructure:** AWS (ECS, ECR, CloudFormation), GitHub Actions, Docker, Turborepo
**Payments / Auth:** Stripe, RBAC, plan-based entitlements
**Workflow:** Git, agentic engineering (multi-agent LLM workflows, parallel agents, automated review), headless commerce (BigCommerce), CMS integration (Prismic)

## Experience

### SDET (Software Developer in Test) @ FloQast — Close QE team · Contract · Remote
Jun 2026 – Oct 2026

- Designed and built a declarative database seeder from a JSON specification, deriving its collections and shapes from the existing codebase.
- Provisioned the accounts, credentials and surrounding data that let more than 1,000 end-to-end tests run against a live dev environment.
- Made the Playwright and legacy Selenium suites run across separate accounts, with the seeder standing up MongoDB records, cloud storage providers (Dropbox, Box) and Harness feature flags for each.
- Drove the suites to green across multiple environments, diagnosing and raising environment-specific failures, and documented the seeder for the wider team — built throughout with agentic LLM workflows.

### Agentic AI Engineer (Full Stack Engineer) @ PostReminder — Contract · Remote · San Francisco, CA, USA
Jul 2025 – Present

- Designed and run the team's agentic development workflow — parallel LLM agents in isolated git worktrees behind automated review gates.
- Monthly merged PRs rose from ~18 to ~100 after adopting it in March 2026 — 770 merges in total, the largest share on a six-engineer team.
- Migrated a legacy PHP product to a Next.js 16 / React 19 / TypeScript monorepo (Turborepo + Bun workspaces), unifying the type system across web, API and shared packages.
- Own the AWS pipeline end to end: GitHub Actions → ECR → ECS via CloudFormation, including scheduled ECS tasks, environment promotion and rollback.
- Own database design on MySQL/Prisma — schema-first migrations, idempotent DDL, and a custom TypeScript runner for safe, resumable production backfills.
- Built two-layer authorization — RBAC plus a plan-based entitlements layer — with Stripe checkout, proration and webhook-driven subscription sync.

### Frontend Web Developer @ Apotheca — Contract · Remote · Part-time from Jul 2025
May 2025 – Feb 2026

- Managed and maintained the Next.js server behind a headless BigCommerce storefront.
- Modelled and integrated Prismic content types, moving a large share of the page into data fetching and cutting roughly 1 MB from page weight.
- Rebuilt the cart flow, replacing a large in-context implementation with a Zustand store.
- Tuned storefront UI against UX requirements and shipped continuous fixes across the site.

### Full Stack Engineer @ Gometrixs — On-site · Santa Cruz, Bolivia
Jun 2024 – Apr 2025

- Led development of Trippin, a greenfield property management system (PMS), owning architecture and end-to-end delivery.
- Coordinated a small engineering team — defined coding standards, ran code reviews and onboarded new contributors.
- Built HR integrations managing the company's people directory and employee profiles.
- Worked across the company ERP, fixing accounting systems and reporting.
- Migrated the codebase from JavaScript to TypeScript.

### Full Stack Engineer @ Viacon Tours — On-site · Santa Cruz, Bolivia
Sep 2023 – Apr 2024

- Helped build the company's internal ERP on a Laravel microservice architecture, contributing to its migration from JavaScript to TypeScript and from PHP 7 to PHP 8.
- Built internal tools and customer-facing features in PHP, React and MySQL.
- Introduced engineering standards — code review process and conventions — and mentored peers.

### Full Stack Engineer @ Freelance — Remote
Feb 2023 – Jul 2023

- Built full-stack projects in Laravel and Vue for a range of clients.

## Education

### Systems Engineering @ Universidad Franz Tamayo — Coursework complete, thesis pending
2020 – 2024

### Computer Science @ University of Buenos Aires (UBA)
2018 – 2019

## Projects

### Remote Claude @ TypeScript, PWA — github.com/99Arrzel/remote-claude

Self-hosted PWA for driving interactive Claude Code terminal sessions from any device.

### BCP Bolivia QR Payments @ Python, ADB — github.com/99Arrzel/BCP-ADB-BOLIVIA

Generates bank payment QRs by automating the Android app over ADB, for a bank with no public API.
`;


/** The same document in Spanish, for `/es/cv`. Section headings match the
 *  Spanish names `lint.ts` recognises, so the ATS checks still pass. */
export const DEFAULT_CV_ES = `---
name: Andrés Carrillo Zelada
title: Ingeniero Full-Stack Agéntico · Next.js / TypeScript / AWS
location: Buenos Aires, Argentina
email: af.carrillo@live.com
links:
  - linkedin.com/in/99arrzel
  - github.com/99Arrzel
extra: Español (nativo) · Inglés C1 — EF SET · Disponible para trabajo remoto global
template: broadsheet
page: Letter
density: tight
accent: #2f62c8
rail:
  - Habilidades Técnicas
  - Educación
---

## Resumen Profesional

Ingeniero full-stack con más de 3 años entregando aplicaciones web en producción de punta a punta, trabajando por contrato para equipos SaaS de Estados Unidos. Recientemente SDET en FloQast, donde construí un seeder declarativo de base de datos que habilitó más de 1.000 pruebas end-to-end en Playwright y Selenium. En PostReminder migré un producto PHP heredado a un monorepo Next.js 16 / React 19 / TypeScript, soy responsable del pipeline de despliegue en AWS ECS y construí suscripciones con Stripe sobre RBAC y permisos por plan. Trabajo en frontend, backend, infraestructura y herramientas de testing, y opero flujos agénticos con LLM que multiplicaron por cinco mi ritmo de entrega.

## Habilidades Técnicas

**Lenguajes:** TypeScript, JavaScript, PHP, Python
**Frontend:** React, Next.js, Vue, Zustand, Tailwind CSS
**Backend y Datos:** Node.js, Laravel, APIs REST, Prisma, MySQL, PostgreSQL, MongoDB
**Testing:** Playwright, Selenium, quality engineering (QE), infraestructura de pruebas end-to-end, seeding declarativo de datos de prueba, feature flags con Harness
**Infraestructura:** AWS (ECS, ECR, CloudFormation), GitHub Actions, Docker, Turborepo
**Pagos / Autorización:** Stripe, RBAC, permisos por plan
**Flujo de trabajo:** Git, ingeniería agéntica (flujos multiagente con LLM, agentes en paralelo, revisión automatizada), headless commerce (BigCommerce), integración de CMS (Prismic)

## Experiencia

### SDET (Software Developer in Test) @ FloQast — Equipo Close QE · Contrato · Remoto
Jun 2026 – Oct 2026

- Diseñé y construí un seeder declarativo de base de datos a partir de una especificación JSON, derivando sus colecciones y estructuras del código existente.
- Aprovisioné las cuentas, credenciales y datos asociados que permitieron correr más de 1.000 pruebas end-to-end contra un entorno de desarrollo real.
- Adapté las suites de Playwright y las heredadas de Selenium para ejecutarse en cuentas separadas.
- El seeder levantaba para cada cuenta los registros de MongoDB, los proveedores de almacenamiento (Dropbox, Box) y los feature flags de Harness.
- Llevé las suites a verde en múltiples entornos, diagnosticando y reportando fallos propios de cada entorno, y documenté el seeder para el resto del equipo.

### Ingeniero Agéntico de IA (Ingeniero Full Stack) @ PostReminder — Contrato · Remoto · San Francisco, CA, EE. UU.
Jul 2025 – Presente

- Diseñé y opero el flujo de desarrollo agéntico del equipo: agentes LLM en paralelo, en git worktrees aislados, detrás de controles de revisión automatizados.
- Los PR mergeados por mes pasaron de ~18 a ~100 tras adoptarlo en marzo de 2026 — 770 merges en total, la mayor parte en un equipo de seis ingenieros.
- Migré un producto PHP heredado a un monorepo Next.js 16 / React 19 / TypeScript (Turborepo + Bun workspaces), unificando el sistema de tipos entre web, API y paquetes compartidos.
- Soy responsable del pipeline de AWS de punta a punta: GitHub Actions → ECR → ECS vía CloudFormation, incluyendo tareas programadas de ECS, promoción entre entornos y rollback.
- Soy responsable del diseño de base de datos en MySQL/Prisma: migraciones schema-first, DDL idempotente y un runner propio en TypeScript para backfills en producción seguros y reanudables.
- Construí un sistema de autorización en dos capas — RBAC más permisos por plan — con checkout, prorrateo y sincronización de suscripciones por webhook en Stripe.

### Desarrollador Web Frontend @ Apotheca — Contrato · Remoto · Medio tiempo desde jul 2025
May 2025 – Feb 2026

- Gestioné y mantuve el servidor Next.js detrás de una tienda headless de BigCommerce.
- Modelé e integré tipos de contenido en Prismic, moviendo buena parte de la página al fetching de datos y recortando cerca de 1 MB del peso de la página.
- Rehíce el flujo del carrito, reemplazando una implementación grande en contexto por un store de Zustand.
- Ajusté la UI de la tienda según los requerimientos de UX y entregué correcciones y mejoras de forma continua.

### Ingeniero Full Stack @ Gometrixs — Presencial · Santa Cruz, Bolivia
Jun 2024 – Abr 2025

- Lideré el desarrollo de Trippin, un sistema de gestión de propiedades (PMS) hecho desde cero, a cargo de la arquitectura y la entrega de punta a punta.
- Coordiné un equipo pequeño de ingeniería: definí estándares de código, hice revisiones y sumé nuevos colaboradores.
- Construí integraciones de RR. HH. para gestionar el directorio de personas y los perfiles de empleados.
- Trabajé sobre el ERP de la empresa, corrigiendo sistemas contables y reportes.
- Migré el código de JavaScript a TypeScript.

### Ingeniero Full Stack @ Viacon Tours — Presencial · Santa Cruz, Bolivia
Sep 2023 – Abr 2024

- Colaboré en la construcción del ERP interno de la empresa sobre una arquitectura de microservicios en Laravel, contribuyendo a su migración de JavaScript a TypeScript y de PHP 7 a PHP 8.
- Construí herramientas internas y funcionalidades de cara al cliente en PHP, React y MySQL.
- Introduje estándares de ingeniería — proceso de revisión de código y convenciones — y acompañé a mis pares.

### Ingeniero Full Stack @ Freelance — Remoto
Feb 2023 – Jul 2023

- Construí proyectos full-stack en Laravel y Vue para distintos clientes.

## Educación

### Ingeniería de Sistemas @ Universidad Franz Tamayo — Cursada completa, tesis pendiente
2020 – 2024

### Ciencias de la Computación @ Universidad de Buenos Aires (UBA)
2018 – 2019

## Proyectos

### Remote Claude @ TypeScript, PWA — github.com/99Arrzel/remote-claude

PWA autoalojada para manejar sesiones interactivas de Claude Code desde cualquier dispositivo.

### BCP Bolivia QR Payments @ Python, ADB — github.com/99Arrzel/BCP-ADB-BOLIVIA

Genera QR de pago bancario automatizando la app de Android por ADB, para un banco sin API pública.
`;

/** Seed for "Start a blank CV". */
export const BLANK_CV = `---
name: Your Name
title: Your Title
location: City, Country
email: you@example.com
links:
  - github.com/you
template: ledger
page: A4
density: tight
accent: #2f62c8
---

## Summary

One or two sentences on what you build and who for.

## Experience

### Job Title @ Company — Remote
Jan 2024 – Present

- Achievement with a number in it, because numbers are what get read.

## Skills

**Languages:**
**Infrastructure:**

## Education

### Degree @ Institution
2018 – 2022
`;
