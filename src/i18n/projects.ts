// Copy for the Projects page.
//
// Repo names and tech tags are proper nouns and stay as they are in both
// locales; only the prose is translated. The project list is duplicated per
// locale rather than shared-with-overrides so a translator edits one flat list
// instead of chasing keys between two files.

import type { Lang } from './index';

type Project = {
	name: string;
	description: string;
	tech: string[];
	url: string;
};

type ProjectsCopy = {
	metaTitle: string;
	metaDescription: string;
	title: string;
	introHtml: string;
	tool: {
		eyebrow: string;
		title: string;
		body: string;
		tags: string[];
		cta: string;
	};
	projects: Project[];
};

const GH = 'https://github.com/99Arrzel';

export const projects: Record<Lang, ProjectsCopy> = {
	en: {
		metaTitle: 'Projects',
		metaDescription: 'Projects by Andres Carrillo',
		title: 'Projects',
		introHtml: `A mix of stuff I actually finished and stuff that got abandoned somewhere between
			"cool idea" and "the day job needs me back". Most of the half-built ones would
			probably be done by now if I'd had AI in 2022, but I didn't &mdash; and I was either
			too tired after work or too lazy on weekends to push them across the finish line.
			Full graveyard on <a href="https://github.com/99arrzel" target="_blank">GitHub</a>.`,
		tool: {
			eyebrow: 'Live tool · runs entirely in your browser',
			title: 'CV Press',
			body: `A CV builder that never phones home. Fill in a form, pick one of four templates, and
				print a PDF with a real text layer — the kind an applicant tracking system can
				actually read. An X-ray panel shows you the plain text a parser pulls back out, which
				is where most good-looking CVs quietly fall apart.`,
			tags: ['Astro', 'TypeScript', 'No server', 'localStorage'],
			cta: 'Open the builder',
		},
		projects: [
			{
				name: 'PMSAC',
				description:
					'ID-card based attendance system that tracks check-in/check-out times using barcode scanning. Uses JSON as a database - zero setup required.',
				tech: ['Node.js', 'Express', 'Bootstrap', 'Html5Qrcode'],
				url: `${GH}/PMSAC`,
			},
			{
				name: 'BCP-ADB-BOLIVIA',
				description:
					"Can't get the bank's QR payment API? Automate BCP Bolivia payment QR generation using your phone via ADB.",
				tech: ['Python', 'ADB'],
				url: `${GH}/BCP-ADB-BOLIVIA`,
			},
			{
				name: 'Ventazanga',
				description: 'A marketplace where sellers must list real prices. No more "price in DM".',
				tech: ['Laravel', 'Vue.js', 'Inertia.js', 'Tailwind'],
				url: `${GH}/Ventazanga`,
			},
			{
				name: 'SuperLMS',
				description:
					'A Learning Management System with 3 roles (Admin, Teacher, Student), classrooms, assignments, forums, and dark mode.',
				tech: ['Laravel', 'Vue.js', 'MySQL', 'Redis'],
				url: `${GH}/SuperLMS`,
			},
			{
				name: 'ERPNPC',
				description:
					'ERP system with modules for business management, built with modern PHP and JavaScript tooling.',
				tech: ['Laravel', 'Vue.js', 'Inertia.js'],
				url: `${GH}/ERPNPC`,
			},
			{
				name: 'PAPP2',
				description: 'Street food place rating app - backend API + React Native frontend.',
				tech: ['AdonisJS', 'TypeScript', 'React Native'],
				url: `${GH}/PAPP2`,
			},
			{
				name: 'PIDwithDimmer',
				description:
					'PID temperature controller with a web dashboard. Uses WebSockets to communicate with an ESP32.',
				tech: ['TypeScript', 'WebSockets', 'ESP32'],
				url: `${GH}/PIDwithDimmer`,
			},
			{
				name: 'OniChanApproves',
				description:
					'A bot that receives SonarQube webhooks and posts a gif depending on whether the quality gate passed or failed.',
				tech: ['TypeScript'],
				url: `${GH}/OniChanApproves`,
			},
			{
				name: 'Prusa-Slicer-Web-Api',
				description: 'Web API wrapper for PrusaSlicer, allowing remote slicing via HTTP requests.',
				tech: ['Rust'],
				url: `${GH}/Prusa-Slicer-Web-Api`,
			},
			{
				name: 'BitFlipDetector',
				description:
					'Cosmic ray bit-flip detector for Raspberry Pi. Allocates memory and monitors for bit changes - intended for high-altitude balloon experiments.',
				tech: ['C'],
				url: `${GH}/BitFlipDetector`,
			},
			{
				name: 'AoC2024-GO',
				description: 'Advent of Code 2024 solutions in Go.',
				tech: ['Go'],
				url: `${GH}/AoC2024-GO`,
			},
			{
				name: 'ShortestPathDijkstra',
				description: "Interactive Dijkstra's shortest path visualization using Cytoscape.js.",
				tech: ['JavaScript', 'Cytoscape.js'],
				url: `${GH}/ShortestPathDijkstra`,
			},
		],
	},
	es: {
		metaTitle: 'Proyectos',
		metaDescription: 'Proyectos de Andres Carrillo',
		title: 'Proyectos',
		introHtml: `Una mezcla de cosas que efectivamente terminé y cosas que quedaron abandonadas en algún
			punto entre "qué buena idea" y "el trabajo me necesita de vuelta". Varias de las que quedaron
			a medias probablemente ya estarían listas si hubiera tenido IA en 2022, pero no la tenía
			&mdash; y o estaba demasiado cansado después del trabajo, o demasiado vago el fin de semana
			como para empujarlas hasta el final. El cementerio completo está en
			<a href="https://github.com/99arrzel" target="_blank">GitHub</a>.`,
		tool: {
			eyebrow: 'Herramienta en vivo · corre entera en tu navegador',
			title: 'CV Press',
			body: `Un editor de CV que nunca manda nada a ningún lado. Completás un formulario, elegís una
				de cuatro plantillas e imprimís un PDF con una capa de texto real — de las que un sistema
				de seguimiento de candidatos (ATS) puede leer de verdad. El panel de rayos X te muestra el
				texto plano que extrae un parser, que es donde la mayoría de los CV bonitos se caen sin
				que nadie se entere.`,
			tags: ['Astro', 'TypeScript', 'Sin servidor', 'localStorage'],
			cta: 'Abrir el editor',
		},
		projects: [
			{
				name: 'PMSAC',
				description:
					'Sistema de asistencia por credencial que registra las horas de entrada y salida escaneando códigos de barras. Usa JSON como base de datos: cero configuración.',
				tech: ['Node.js', 'Express', 'Bootstrap', 'Html5Qrcode'],
				url: `${GH}/PMSAC`,
			},
			{
				name: 'BCP-ADB-BOLIVIA',
				description:
					'¿El banco no te da una API de pagos por QR? Automatizá la generación de QR de pago del BCP Bolivia desde tu teléfono vía ADB.',
				tech: ['Python', 'ADB'],
				url: `${GH}/BCP-ADB-BOLIVIA`,
			},
			{
				name: 'Ventazanga',
				description:
					'Un marketplace donde los vendedores están obligados a publicar precios reales. Se acabó el "precio por privado".',
				tech: ['Laravel', 'Vue.js', 'Inertia.js', 'Tailwind'],
				url: `${GH}/Ventazanga`,
			},
			{
				name: 'SuperLMS',
				description:
					'Un sistema de gestión de aprendizaje con 3 roles (Admin, Docente, Estudiante), aulas, tareas, foros y modo oscuro.',
				tech: ['Laravel', 'Vue.js', 'MySQL', 'Redis'],
				url: `${GH}/SuperLMS`,
			},
			{
				name: 'ERPNPC',
				description:
					'Sistema ERP con módulos de gestión empresarial, construido con herramientas modernas de PHP y JavaScript.',
				tech: ['Laravel', 'Vue.js', 'Inertia.js'],
				url: `${GH}/ERPNPC`,
			},
			{
				name: 'PAPP2',
				description:
					'App para calificar puestos de comida callejera: API en el backend + frontend en React Native.',
				tech: ['AdonisJS', 'TypeScript', 'React Native'],
				url: `${GH}/PAPP2`,
			},
			{
				name: 'PIDwithDimmer',
				description:
					'Controlador PID de temperatura con panel web. Usa WebSockets para comunicarse con un ESP32.',
				tech: ['TypeScript', 'WebSockets', 'ESP32'],
				url: `${GH}/PIDwithDimmer`,
			},
			{
				name: 'OniChanApproves',
				description:
					'Un bot que recibe webhooks de SonarQube y publica un gif según si la quality gate pasó o falló.',
				tech: ['TypeScript'],
				url: `${GH}/OniChanApproves`,
			},
			{
				name: 'Prusa-Slicer-Web-Api',
				description:
					'Envoltorio de API web para PrusaSlicer, que permite laminar en remoto vía peticiones HTTP.',
				tech: ['Rust'],
				url: `${GH}/Prusa-Slicer-Web-Api`,
			},
			{
				name: 'BitFlipDetector',
				description:
					'Detector de bit-flips por rayos cósmicos para Raspberry Pi. Reserva memoria y vigila los cambios de bits: pensado para experimentos en globos de gran altura.',
				tech: ['C'],
				url: `${GH}/BitFlipDetector`,
			},
			{
				name: 'AoC2024-GO',
				description: 'Soluciones del Advent of Code 2024 en Go.',
				tech: ['Go'],
				url: `${GH}/AoC2024-GO`,
			},
			{
				name: 'ShortestPathDijkstra',
				description:
					'Visualización interactiva del camino más corto de Dijkstra usando Cytoscape.js.',
				tech: ['JavaScript', 'Cytoscape.js'],
				url: `${GH}/ShortestPathDijkstra`,
			},
		],
	},
};
