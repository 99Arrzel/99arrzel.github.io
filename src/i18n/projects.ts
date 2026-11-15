// Copy for the Projects page.
//
// Each project is a brief: what it is, how it works, and what it's built
// with. Repo names and tech tags are proper nouns and stay as they are in both
// locales; only the prose is translated. The list is duplicated per locale
// rather than shared-with-overrides so a translator edits one flat list
// instead of chasing keys between two files.
//
// `body` strings carry inline markup (links, <code>) and are rendered with
// set:html; everything else is plain text.

import type { Lang } from './index';

/** One box in a project's "how it works" strip. */
type Step = { title: string; note: string };

/**
 * A screenshot. `key` names a file imported in ProjectsPage.astro (see the
 * `shots` map there); the image is shared by both locales, the alt text isn't.
 */
type Shot = { key: string; alt: string };

export type Project = {
	/** Its id in the URL (`/projects#pmsac`) and in the menu. Same in both locales. */
	slug: string;
	name: string;
	year: string;
	/** What kind of thing it is, shown as the small label above the name. */
	kind: string;
	tagline: string;
	body: string[];
	steps?: Step[];
	shots?: Shot[];
	/** Advent of Code only: the days that have a solution. */
	days?: number[];
	tech: string[];
	/** Source repository. */
	url?: string;
	/** A second repository worth linking, with its own label. */
	extra?: { label: string; url: string };
	/** Somewhere it can be used right now. */
	demo?: string;
};

type Group = { label: string; projects: Project[] };

type ProjectsCopy = {
	metaTitle: string;
	metaDescription: string;
	title: string;
	introHtml: string;
	menuLabel: string;
	howTitle: string;
	stackTitle: string;
	repoLabel: string;
	demoLabel: string;
	/** Label and link text for the one project that lives on this site. */
	toolCta: string;
	daysCaption: string;
	groups: Group[];
};

const GH = 'https://github.com/99Arrzel';

export const projects: Record<Lang, ProjectsCopy> = {
	en: {
		metaTitle: 'Projects',
		metaDescription:
			'What each of my side projects is, how it works and what it is built with.',
		title: 'Projects',
		introHtml: `Side projects, mostly built to fix a problem I actually had: a bank with no payment API,
			marketplace listings with no prices, attendance tracked by hand. Some are finished tools,
			some are experiments. My professional work is on the <a href="/#work">home page</a> and in
			my <a href="/resume">CV</a>; the rest of my code is on
			<a href="https://github.com/99arrzel" target="_blank" rel="noopener">GitHub</a>.`,
		menuLabel: 'Projects',
		howTitle: 'How it works',
		stackTitle: 'Built with',
		repoLabel: 'Source on GitHub',
		demoLabel: 'Try it live',
		toolCta: 'Open the builder',
		daysCaption: 'Days with a solution in the repo',
		groups: [
			{
				label: 'On this site',
				projects: [
					{
						slug: 'cv-press',
						name: 'CV Press',
						year: '2026',
						kind: 'Live tool · runs entirely in your browser',
						tagline: 'A CV builder that never phones home.',
						body: [
							`Fill in a form, pick one of four templates, and print a PDF with a real text layer
							 &mdash; the kind an applicant tracking system can actually read. An X-ray panel
							 shows you the plain text a parser pulls back out, which is where most
							 good-looking CVs quietly fall apart.`,
							`There is no server, no upload and no account. The CV is a markdown document saved
							 in your browser; the form and the markdown are two views of the same thing, and a
							 share link carries the whole CV inside the URL. My own CV on this site is written
							 in it.`,
						],
						shots: [{ key: 'cv-press', alt: 'The CV Press builder: a markdown editor on the left, template picker and print controls on the right.' }],
						steps: [
							{ title: 'Write', note: 'A form or plain markdown. Both edit the same document.' },
							{ title: 'Pick a template', note: 'Four layouts, each labelled with its parse risk.' },
							{ title: 'X-ray', note: 'See the text a parser would extract from the PDF.' },
							{ title: 'Print', note: 'Browser print to PDF. Nothing leaves the tab.' },
						],
						tech: ['Astro', 'TypeScript', 'No server', 'localStorage'],
					},
				],
			},
			{
				label: 'Automation & APIs',
				projects: [
					{
						slug: 'bcp-adb-bolivia',
						name: 'BCP-ADB-BOLIVIA',
						year: '2026',
						kind: 'Automation',
						tagline: 'The bank has no QR payment API, so my phone became one.',
						body: [
							`BCP Bolivia will happily generate a payment QR inside its mobile app, and offers no
							 way to do the same from code. This script drives the real app over ADB: it opens it,
							 logs in, walks to the QR screen, types the amount, takes a screenshot and decodes
							 the QR out of the image.`,
							`The QR string comes out on stdout and the progress log on stderr, so it pipes into
							 anything. It polls the screen instead of sleeping, needs no root, and logs out when
							 it is done. A full run takes 30 to 40 seconds, most of it the bank's app loading.
							 There is also a variant that runs on the phone itself through Termux and wireless
							 debugging, no computer involved.`,
						],
						steps: [
							{ title: 'Command', note: 'One flag: the amount to charge.' },
							{ title: 'ADB', note: 'Opens the bank app on the phone and logs in.' },
							{ title: 'Navigate', note: 'Taps through to the QR screen, types the amount.' },
							{ title: 'Capture', note: 'Screenshots the phone and decodes the QR.' },
							{ title: 'Output', note: 'The QR string, on stdout.' },
						],
						tech: ['Python', 'ADB', 'uiautomator', 'pyzbar'],
						url: `${GH}/BCP-ADB-BOLIVIA`,
					},
					{
						slug: 'prusa-slicer-web-api',
						name: 'Prusa-Slicer-Web-Api',
						year: '2023',
						kind: 'API',
						tagline: 'PrusaSlicer behind an HTTP endpoint, to quote 3D prints.',
						body: [
							`Part of a quoting system for people who 3D print for money. To price a part you
							 need to know how much filament it eats and how long the machine is busy, with your
							 own printer profile.`,
							`So this wraps the PrusaSlicer command line in a small Actix server. POST an STL and
							 a config <code>.ini</code> to <code>/slice</code>; it writes both to disk, slices,
							 reads the totals back out of the generated G-code, cleans up and answers with JSON:
							 filament in millimetres, cubic centimetres and grams, plus the estimated print
							 time. Under 200 lines of Rust, shipped as a Docker image.`,
						],
						steps: [
							{ title: 'Upload', note: 'An STL and a printer config, as form data.' },
							{ title: 'Slice', note: 'The PrusaSlicer CLI turns them into G-code.' },
							{ title: 'Read', note: 'Filament and time, from the end of the G-code.' },
							{ title: 'Answer', note: 'JSON with length, volume, weight and time.' },
						],
						tech: ['Rust', 'Actix Web', 'Tokio', 'Docker'],
						url: `${GH}/Prusa-Slicer-Web-Api`,
					},
					{
						slug: 'onichanapproves',
						name: 'OniChanApproves',
						year: '2024',
						kind: 'Bot · unfinished',
						tagline: "SonarQube's verdict, delivered as an anime gif.",
						body: [
							`The plan: when an analysis finishes, SonarQube posts the quality gate result to this
							 bot, and the bot answers on the pull request with a gif. A cheer if the gate
							 passed, an angry stare if it did not.`,
							`Where it got to: one Express file in a Docker container. It receives the webhook and
							 it can fetch a random reaction gif; the last step, posting that gif to GitHub, is
							 still commented out.`,
						],
						steps: [
							{ title: 'SonarQube', note: 'An analysis finishes.' },
							{ title: 'Webhook', note: 'The quality gate result arrives as JSON.' },
							{ title: 'Reaction', note: 'Passed: cheers. Failed: angry stare.' },
							{ title: 'Gif', note: 'A random one for that reaction.' },
							{ title: 'Pull request', note: 'Comment it. Not wired up yet.' },
						],
						tech: ['TypeScript', 'Express', 'Octokit', 'Docker'],
						url: `${GH}/OniChanApproves`,
					},
				],
			},
			{
				label: 'Web apps',
				projects: [
					{
						slug: 'pmsac',
						name: 'PMSAC',
						year: '2021',
						kind: 'Web app',
						tagline: 'Attendance by ID card, with a JSON file for a database.',
						body: [
							`PMSAC stands for <em>Poor Man's System Attendance Control</em>. An employee holds
							 their ID card up to the camera, the barcode is read right in the browser, and the
							 server works out whether that scan is a check-in or a check-out from the last
							 thing it recorded for them.`,
							`Admins register people with a photo, browse every record in a searchable table and
							 export it to Excel, CSV or PDF. There is no database server: everything lives in
							 one JSON file, read at boot and rewritten on every change. For one office and one
							 terminal that was enough &mdash; I wrote up
							 <a href="/vault/json-as-a-database/">when it stops being enough</a> in the Vault.`,
						],
						shots: [
							{ key: 'pmsac-scan', alt: 'The PMSAC check-in page: employee details next to a live camera view with a barcode scanning frame.' },
							{ key: 'pmsac-records', alt: 'The PMSAC attendance table with entry and exit times and buttons to export to CSV, Excel and PDF.' },
						],
						steps: [
							{ title: 'Scan', note: 'Html5Qrcode reads the barcode from the camera.' },
							{ title: 'Match', note: 'Express finds the ID in the data it holds in memory.' },
							{ title: 'Decide', note: 'Last record was an entry? This one is an exit.' },
							{ title: 'Save', note: 'The whole JSON file is written back to disk.' },
							{ title: 'Report', note: 'DataTables to search, sort and export.' },
						],
						tech: ['Node.js', 'Express', 'Bootstrap', 'Html5Qrcode', 'DataTables'],
						url: `${GH}/PMSAC`,
					},
					{
						slug: 'ventazanga',
						name: 'Ventazanga',
						year: '2022',
						kind: 'Web app',
						tagline: 'A marketplace where "price in DM" is not an option.',
						body: [
							`Every marketplace group has the same post: a photo, and "inbox for price". You
							 message, you wait, and half the time the number is absurd. Ventazanga makes the
							 price a required field. List it, or don't post.`,
							`Under that one rule it is a regular marketplace: accounts, listings with photos, a
							 category tree where each category has its own characteristics, brands, cities, and
							 an admin area to manage all of it. Laravel and Vue with Inertia in between, so
							 there is no separate API to keep in sync. The database is more ambitious than the
							 screens: reviews, shipping and invoices have tables and no UI yet.`,
						],
						steps: [
							{ title: 'Sign up', note: 'Sellers and buyers share one kind of account.' },
							{ title: 'Describe it', note: 'Photos, category, the characteristics that category asks for.' },
							{ title: 'Price it', note: 'Required. No price, no listing.' },
							{ title: 'Browse', note: 'Every card shows what it costs.' },
						],
						tech: ['Laravel', 'Vue.js', 'Inertia.js', 'Tailwind', 'PrimeVue', 'MySQL'],
						url: `${GH}/Ventazanga`,
					},
					{
						slug: 'superlms',
						name: 'SuperLMS',
						year: '2022',
						kind: 'Web app',
						tagline: 'A small learning platform: classrooms, assignments, forums, grades.',
						body: [
							`Three roles. Admins manage users and hand out courses, teachers build the classroom
							 and grade, students submit work and argue in the forums.`,
							`A classroom is split into milestones, and each milestone holds assignments and
							 forums. Assignments take several submissions with file attachments and get a grade;
							 forums take rich text and inline images. Everything closes on its due date, no late
							 submissions. Light and dark mode, about six thousand lines in all.`,
						],
						steps: [
							{ title: 'Admin', note: 'Creates users and classrooms, assigns teachers.' },
							{ title: 'Teacher', note: 'Adds milestones, then assignments and forums inside them.' },
							{ title: 'Student', note: 'Uploads submissions, posts in the forums.' },
							{ title: 'Deadline', note: 'The assignment closes on its due date.' },
							{ title: 'Grade', note: 'The teacher grades; the student sees it.' },
						],
						tech: ['Laravel', 'Vue.js', 'MySQL', 'Redis'],
						url: `${GH}/SuperLMS`,
					},
					{
						slug: 'erpnpc',
						name: 'ERPNPC',
						year: '2022',
						kind: 'Web app · university project',
						tagline: 'An accounting-first ERP, built for a university ERP course.',
						body: [
							`Multi-company from the first screen. Each company gets its own fiscal years and
							 periods, a chart of accounts, exchange rates, and vouchers with their line items.`,
							`On top of the ledger sits a small inventory: categories, items and batches. A
							 purchase note adds stock and a sale note removes it, and each one posts its own
							 voucher through the accounts the company configured for that. The reports come out
							 the other end: opening balance, journal, general ledger, trial balance, income
							 statement and balance sheet.`,
						],
						steps: [
							{ title: 'Company', note: 'Pick one; everything below belongs to it.' },
							{ title: 'Fiscal year', note: 'Split into periods that open and close.' },
							{ title: 'Accounts', note: 'The chart of accounts, plus which ones notes post to.' },
							{ title: 'Vouchers & notes', note: 'Manual entries, purchases and sales.' },
							{ title: 'Reports', note: 'Journal, ledger, trial balance, statements.' },
						],
						tech: ['Laravel', 'Vue.js', 'Inertia.js', 'MySQL'],
						url: `${GH}/ERPNPC`,
					},
					{
						slug: 'papp2',
						name: 'PAPP2',
						year: '2023',
						kind: 'API + mobile app',
						tagline: 'Ratings for the street food stand, not the restaurant.',
						body: [
							`The backend of a street-food rating app: places, their menus and photos, categories,
							 and reviews. Anyone signed in can suggest a new place; it waits in a queue until it
							 is accepted or rejected.`,
							`Photos never pass through the API. The client asks for a pre-signed URL and uploads
							 straight to object storage. The phone side is a separate React Native app.`,
						],
						steps: [
							{ title: 'App', note: 'React Native client, signed in with a token.' },
							{ title: 'Suggest', note: 'A user proposes a stand that is not listed yet.' },
							{ title: 'Review queue', note: 'The suggestion is accepted or rejected.' },
							{ title: 'Rate', note: 'Reviews and photos on the places that made it.' },
						],
						tech: ['AdonisJS', 'TypeScript', 'PostgreSQL', 'MinIO', 'React Native'],
						url: `${GH}/PAPP2`,
						extra: { label: 'Mobile app source', url: `${GH}/PAPP2FRONTEND` },
					},
				],
			},
			{
				label: 'Hardware',
				projects: [
					{
						slug: 'pidwithdimmer',
						name: 'PIDwithDimmer',
						year: '2023',
						kind: 'Firmware + dashboard',
						tagline: 'A PID temperature controller you tune from a browser.',
						body: [
							`An ESP32 reads a thermocouple and holds a temperature. A TRIAC dimmer, fired off the
							 mains zero-crossing, drives the heater; a PWM fan does the cooling.`,
							`The same ESP32 runs a WebSocket server. A React dashboard connects to it, plots the
							 temperature live and lets you change the setpoint, Kp, Ki, Kd and the integral
							 limit while the loop is running &mdash; or override the loop and drive the heater
							 and the fan by hand.`,
						],
						steps: [
							{ title: 'Measure', note: 'A MAX6675 thermocouple reads the temperature.' },
							{ title: 'PID', note: 'The ESP32 works out how far off it is, and by how much to correct.' },
							{ title: 'Act', note: 'More heater through the dimmer, or more fan.' },
							{ title: 'Report', note: 'Every term of the loop goes out over a WebSocket.' },
							{ title: 'Tune', note: 'The dashboard plots it and sends new gains back.' },
						],
						tech: ['C++', 'ESP32', 'PlatformIO', 'React', 'WebSockets', 'Plotly'],
						url: `${GH}/PIDwithDimmer`,
					},
					{
						slug: 'bitflipdetector',
						name: 'BitFlipDetector',
						year: '2021',
						kind: 'Experiment',
						tagline: 'Waiting for a cosmic ray to flip a bit.',
						body: [
							`Written to ride on a Raspberry Pi under a high-altitude balloon, where there is less
							 atmosphere between the memory and the cosmic rays.`,
							`It reserves 850 MB of RAM, pins it so it cannot be swapped out, fills it with zeros
							 and then adds every byte up, over and over. The sum should stay the same forever.
							 The moment it does not, a bit has flipped, and the time goes into a log file. Sixty
							 lines of C.`,
						],
						steps: [
							{ title: 'Reserve', note: '850 MB, locked into physical memory.' },
							{ title: 'Zero', note: 'Every byte set to 0.' },
							{ title: 'Sum', note: 'Add all of them up. Again. And again.' },
							{ title: 'Compare', note: 'Did the total change since the last pass?' },
							{ title: 'Log', note: 'If so: timestamp, into a file.' },
						],
						tech: ['C', 'Raspberry Pi'],
						url: `${GH}/BitFlipDetector`,
					},
				],
			},
			{
				label: 'Algorithms',
				projects: [
					{
						slug: 'shortestpathdijkstra',
						name: 'ShortestPathDijkstra',
						year: '2021',
						kind: 'Visualisation · university project',
						tagline: 'Draw a graph, ask for the cheapest route.',
						body: [
							`A single HTML page from an Operations Research course. Add edges as origin,
							 destination and cost, and the graph draws itself as you go. Then pick two nodes: it
							 runs Dijkstra, marks the route and tells you what the trip costs.`,
							`The interface is in Spanish, and it still runs: the link below is the page itself.`,
						],
						shots: [{ key: 'dijkstra', alt: 'A directed graph of seven nodes with weighted edges, above a table of the edges and a form reporting that the cheapest trip from A to G costs 20.' }],
						steps: [
							{ title: 'Add edges', note: 'Origin, destination, cost.' },
							{ title: 'Draw', note: 'Cytoscape.js lays the graph out.' },
							{ title: 'Ask', note: 'Choose where to start and where to end.' },
							{ title: 'Dijkstra', note: 'The cheapest route, and its total.' },
						],
						tech: ['JavaScript', 'Cytoscape.js', 'Bootstrap'],
						url: `${GH}/ShortestPathDijkstra`,
						demo: 'https://99arrzel.github.io/ShortestPathDijkstra/RutaMasCorta.html',
					},
					{
						slug: 'aoc2024-go',
						name: 'AoC2024-GO',
						year: '2024',
						kind: 'Puzzles',
						tagline: 'Advent of Code 2024, in Go.',
						body: [
							`My solutions to Advent of Code 2024: one folder per day, with the puzzle input next
							 to the code that eats it. Days 1 to 6 and day 11 are in. The other eighteen are
							 not.`,
						],
						days: [1, 2, 3, 4, 5, 6, 11],
						tech: ['Go'],
						url: `${GH}/AoC2024-GO`,
					},
				],
			},
		],
	},
	es: {
		metaTitle: 'Proyectos',
		metaDescription:
			'Qué es cada uno de mis proyectos personales, cómo funciona y con qué está hecho.',
		title: 'Proyectos',
		introHtml: `Proyectos personales, casi todos hechos para resolver un problema que tenía de verdad:
			un banco sin API de pagos, publicaciones de marketplace sin precio, asistencia anotada a mano.
			Algunos son herramientas terminadas, otros son experimentos. Mi trabajo profesional está en el
			<a href="/es/#work">inicio</a> y en mi <a href="/es/resume">CV</a>; el resto de mi código está en
			<a href="https://github.com/99arrzel" target="_blank" rel="noopener">GitHub</a>.`,
		menuLabel: 'Proyectos',
		howTitle: 'Cómo funciona',
		stackTitle: 'Hecho con',
		repoLabel: 'Código en GitHub',
		demoLabel: 'Probarlo en vivo',
		toolCta: 'Abrir el editor',
		daysCaption: 'Días con solución en el repo',
		groups: [
			{
				label: 'En este sitio',
				projects: [
					{
						slug: 'cv-press',
						name: 'CV Press',
						year: '2026',
						kind: 'Herramienta en vivo · corre entera en tu navegador',
						tagline: 'Un editor de CV que nunca manda nada a ningún lado.',
						body: [
							`Completás un formulario, elegís una de cuatro plantillas e imprimís un PDF con una
							 capa de texto real &mdash; de las que un sistema de seguimiento de candidatos (ATS)
							 puede leer de verdad. El panel de rayos X te muestra el texto plano que extrae un
							 parser, que es donde la mayoría de los CV bonitos se caen sin que nadie se entere.`,
							`No hay servidor, ni subida de archivos, ni cuenta. El CV es un documento markdown
							 guardado en tu navegador; el formulario y el markdown son dos vistas de lo mismo, y
							 el enlace para compartir lleva el CV entero dentro de la URL. Mi propio CV en este
							 sitio está escrito ahí.`,
						],
						shots: [{ key: 'cv-press', alt: 'El editor de CV Press: un editor de markdown a la izquierda, selector de plantilla y controles de impresión a la derecha.' }],
						steps: [
							{ title: 'Escribir', note: 'Formulario o markdown. Los dos editan el mismo documento.' },
							{ title: 'Elegir plantilla', note: 'Cuatro diseños, cada uno con su riesgo de parseo.' },
							{ title: 'Rayos X', note: 'El texto que un parser sacaría del PDF.' },
							{ title: 'Imprimir', note: 'A PDF desde el navegador. Nada sale de la pestaña.' },
						],
						tech: ['Astro', 'TypeScript', 'Sin servidor', 'localStorage'],
					},
				],
			},
			{
				label: 'Automatización y APIs',
				projects: [
					{
						slug: 'bcp-adb-bolivia',
						name: 'BCP-ADB-BOLIVIA',
						year: '2026',
						kind: 'Automatización',
						tagline: 'El banco no tiene API de cobros por QR, así que mi teléfono pasó a serlo.',
						body: [
							`El BCP de Bolivia genera sin problema un QR de cobro dentro de su app móvil, y no
							 ofrece ninguna forma de hacer lo mismo desde código. Este script maneja la app real
							 por ADB: la abre, inicia sesión, navega hasta la pantalla de QR, escribe el monto,
							 saca una captura y decodifica el QR de la imagen.`,
							`El string del QR sale por stdout y el registro de progreso por stderr, así que se
							 puede encadenar con cualquier cosa. Consulta la pantalla en vez de esperar tiempos
							 fijos, no necesita root y cierra la sesión al terminar. Una corrida completa tarda
							 entre 30 y 40 segundos, casi todo la app del banco cargando. También hay una
							 variante que corre en el mismo teléfono con Termux y depuración inalámbrica, sin
							 computadora.`,
						],
						steps: [
							{ title: 'Comando', note: 'Un solo parámetro: el monto a cobrar.' },
							{ title: 'ADB', note: 'Abre la app del banco en el teléfono e inicia sesión.' },
							{ title: 'Navegar', note: 'Toca hasta llegar al QR y escribe el monto.' },
							{ title: 'Capturar', note: 'Saca una captura del teléfono y decodifica el QR.' },
							{ title: 'Salida', note: 'El string del QR, por stdout.' },
						],
						tech: ['Python', 'ADB', 'uiautomator', 'pyzbar'],
						url: `${GH}/BCP-ADB-BOLIVIA`,
					},
					{
						slug: 'prusa-slicer-web-api',
						name: 'Prusa-Slicer-Web-Api',
						year: '2023',
						kind: 'API',
						tagline: 'PrusaSlicer detrás de un endpoint HTTP, para cotizar impresiones 3D.',
						body: [
							`Parte de un sistema de cotización para quienes imprimen en 3D por encargo. Para
							 ponerle precio a una pieza hay que saber cuánto filamento consume y cuánto tiempo
							 ocupa la máquina, con el perfil de tu propia impresora.`,
							`Así que esto envuelve la línea de comandos de PrusaSlicer en un servidor Actix
							 chico. Mandás por POST un STL y un <code>.ini</code> de configuración a
							 <code>/slice</code>; escribe los dos a disco, lamina, lee los totales del G-code
							 generado, limpia y responde con JSON: filamento en milímetros, centímetros cúbicos
							 y gramos, más el tiempo estimado de impresión. Menos de 200 líneas de Rust,
							 distribuido como imagen de Docker.`,
						],
						steps: [
							{ title: 'Subir', note: 'Un STL y la configuración de la impresora, como formulario.' },
							{ title: 'Laminar', note: 'La CLI de PrusaSlicer los convierte en G-code.' },
							{ title: 'Leer', note: 'Filamento y tiempo, del final del G-code.' },
							{ title: 'Responder', note: 'JSON con largo, volumen, peso y tiempo.' },
						],
						tech: ['Rust', 'Actix Web', 'Tokio', 'Docker'],
						url: `${GH}/Prusa-Slicer-Web-Api`,
					},
					{
						slug: 'onichanapproves',
						name: 'OniChanApproves',
						year: '2024',
						kind: 'Bot · sin terminar',
						tagline: 'El veredicto de SonarQube, entregado como un gif de anime.',
						body: [
							`El plan: cuando termina un análisis, SonarQube le manda a este bot el resultado de
							 la quality gate, y el bot responde en el pull request con un gif. Un festejo si
							 pasó, una mirada furiosa si no.`,
							`Hasta dónde llegó: un archivo de Express en un contenedor de Docker. Recibe el
							 webhook y sabe buscar un gif de reacción al azar; el último paso, publicar ese gif
							 en GitHub, sigue comentado.`,
						],
						steps: [
							{ title: 'SonarQube', note: 'Termina un análisis.' },
							{ title: 'Webhook', note: 'Llega el resultado de la quality gate en JSON.' },
							{ title: 'Reacción', note: 'Pasó: festejo. Falló: mirada furiosa.' },
							{ title: 'Gif', note: 'Uno al azar para esa reacción.' },
							{ title: 'Pull request', note: 'Comentarlo. Todavía sin conectar.' },
						],
						tech: ['TypeScript', 'Express', 'Octokit', 'Docker'],
						url: `${GH}/OniChanApproves`,
					},
				],
			},
			{
				label: 'Aplicaciones web',
				projects: [
					{
						slug: 'pmsac',
						name: 'PMSAC',
						year: '2021',
						kind: 'Aplicación web',
						tagline: 'Asistencia por credencial, con un archivo JSON como base de datos.',
						body: [
							`PMSAC significa <em>Poor Man's System Attendance Control</em>. El empleado acerca su
							 credencial a la cámara, el código de barras se lee ahí mismo en el navegador, y el
							 servidor decide si ese escaneo es una entrada o una salida según lo último que
							 registró de esa persona.`,
							`Los administradores registran al personal con foto, recorren todos los registros en
							 una tabla con búsqueda y los exportan a Excel, CSV o PDF. No hay servidor de base de
							 datos: todo vive en un archivo JSON que se lee al arrancar y se reescribe con cada
							 cambio. Para una oficina y una terminal alcanzó &mdash; en la Bóveda escribí
							 <a href="/vault/json-as-a-database/">cuándo deja de alcanzar</a> (en inglés).`,
						],
						shots: [
							{ key: 'pmsac-scan', alt: 'La página de marcado de PMSAC: los datos del empleado junto a la cámara en vivo con un marco para escanear el código de barras.' },
							{ key: 'pmsac-records', alt: 'La tabla de asistencia de PMSAC con horas de entrada y salida y botones para exportar a CSV, Excel y PDF.' },
						],
						steps: [
							{ title: 'Escanear', note: 'Html5Qrcode lee el código de barras desde la cámara.' },
							{ title: 'Buscar', note: 'Express encuentra el ID en los datos que tiene en memoria.' },
							{ title: 'Decidir', note: '¿Lo último fue una entrada? Esto es una salida.' },
							{ title: 'Guardar', note: 'Se reescribe el archivo JSON completo.' },
							{ title: 'Reportar', note: 'DataTables para buscar, ordenar y exportar.' },
						],
						tech: ['Node.js', 'Express', 'Bootstrap', 'Html5Qrcode', 'DataTables'],
						url: `${GH}/PMSAC`,
					},
					{
						slug: 'ventazanga',
						name: 'Ventazanga',
						year: '2022',
						kind: 'Aplicación web',
						tagline: 'Un marketplace donde "precio por privado" no es una opción.',
						body: [
							`En todos los grupos de compraventa está la misma publicación: una foto y "precio por
							 inbox". Escribís, esperás, y la mitad de las veces el número es un disparate.
							 Ventazanga hace que el precio sea un campo obligatorio. Lo ponés, o no publicás.`,
							`Debajo de esa única regla es un marketplace común: cuentas, publicaciones con fotos,
							 un árbol de categorías donde cada una tiene sus propias características, marcas,
							 ciudades, y un panel de administración para manejar todo eso. Laravel y Vue con
							 Inertia en el medio, así que no hay una API aparte que mantener sincronizada. La
							 base de datos es más ambiciosa que las pantallas: reseñas, envíos y facturas tienen
							 tablas y todavía ninguna interfaz.`,
						],
						steps: [
							{ title: 'Registrarse', note: 'Vendedores y compradores usan el mismo tipo de cuenta.' },
							{ title: 'Describir', note: 'Fotos, categoría, y las características que esa categoría pide.' },
							{ title: 'Poner precio', note: 'Obligatorio. Sin precio no hay publicación.' },
							{ title: 'Explorar', note: 'Cada tarjeta muestra cuánto cuesta.' },
						],
						tech: ['Laravel', 'Vue.js', 'Inertia.js', 'Tailwind', 'PrimeVue', 'MySQL'],
						url: `${GH}/Ventazanga`,
					},
					{
						slug: 'superlms',
						name: 'SuperLMS',
						year: '2022',
						kind: 'Aplicación web',
						tagline: 'Una plataforma educativa chica: aulas, tareas, foros, notas.',
						body: [
							`Tres roles. Los administradores manejan usuarios y reparten cursos, los docentes
							 arman el aula y califican, los estudiantes entregan trabajos y discuten en los
							 foros.`,
							`Un aula se divide en metas, y cada meta contiene tareas y foros. Las tareas aceptan
							 varias entregas con archivos adjuntos y reciben una nota; los foros aceptan texto
							 enriquecido e imágenes incrustadas. Todo cierra en su fecha de entrega, sin entregas
							 tardías. Modo claro y oscuro, unas seis mil líneas en total.`,
						],
						steps: [
							{ title: 'Admin', note: 'Crea usuarios y aulas, asigna docentes.' },
							{ title: 'Docente', note: 'Agrega metas, y dentro de ellas tareas y foros.' },
							{ title: 'Estudiante', note: 'Sube entregas, participa en los foros.' },
							{ title: 'Vencimiento', note: 'La tarea cierra en su fecha de entrega.' },
							{ title: 'Nota', note: 'El docente califica; el estudiante la ve.' },
						],
						tech: ['Laravel', 'Vue.js', 'MySQL', 'Redis'],
						url: `${GH}/SuperLMS`,
					},
					{
						slug: 'erpnpc',
						name: 'ERPNPC',
						year: '2022',
						kind: 'Aplicación web · proyecto universitario',
						tagline: 'Un ERP con la contabilidad primero, hecho para una materia de ERP.',
						body: [
							`Multiempresa desde la primera pantalla. Cada empresa tiene sus gestiones y periodos,
							 su plan de cuentas, tipos de cambio y comprobantes con sus detalles.`,
							`Sobre la contabilidad hay un inventario chico: categorías, artículos y lotes. Una
							 nota de compra suma stock y una nota de venta lo resta, y cada una genera su propio
							 comprobante con las cuentas de integración que la empresa configuró. Del otro lado
							 salen los reportes: balance inicial, libro diario, libro mayor, sumas y saldos,
							 estado de resultados y balance general.`,
						],
						steps: [
							{ title: 'Empresa', note: 'Elegís una; todo lo demás le pertenece.' },
							{ title: 'Gestión', note: 'Dividida en periodos que se abren y se cierran.' },
							{ title: 'Cuentas', note: 'El plan de cuentas, y a cuáles van las notas.' },
							{ title: 'Comprobantes y notas', note: 'Asientos manuales, compras y ventas.' },
							{ title: 'Reportes', note: 'Diario, mayor, sumas y saldos, estados.' },
						],
						tech: ['Laravel', 'Vue.js', 'Inertia.js', 'MySQL'],
						url: `${GH}/ERPNPC`,
					},
					{
						slug: 'papp2',
						name: 'PAPP2',
						year: '2023',
						kind: 'API + app móvil',
						tagline: 'Calificaciones para el puesto de la calle, no para el restaurante.',
						body: [
							`El backend de una app para calificar comida callejera: locales, sus menús y fotos,
							 categorías y reseñas. Cualquiera con cuenta puede sugerir un local nuevo; queda en
							 una cola hasta que se lo acepta o se lo rechaza.`,
							`Las fotos nunca pasan por la API. El cliente pide una URL prefirmada y sube directo
							 al almacenamiento de objetos. El lado del teléfono es una app aparte en React
							 Native.`,
						],
						steps: [
							{ title: 'App', note: 'Cliente en React Native, autenticado con un token.' },
							{ title: 'Sugerir', note: 'Un usuario propone un puesto que todavía no está.' },
							{ title: 'Cola de revisión', note: 'La sugerencia se acepta o se rechaza.' },
							{ title: 'Calificar', note: 'Reseñas y fotos en los locales que entraron.' },
						],
						tech: ['AdonisJS', 'TypeScript', 'PostgreSQL', 'MinIO', 'React Native'],
						url: `${GH}/PAPP2`,
						extra: { label: 'Código de la app móvil', url: `${GH}/PAPP2FRONTEND` },
					},
				],
			},
			{
				label: 'Hardware',
				projects: [
					{
						slug: 'pidwithdimmer',
						name: 'PIDwithDimmer',
						year: '2023',
						kind: 'Firmware + panel',
						tagline: 'Un controlador PID de temperatura que se ajusta desde el navegador.',
						body: [
							`Un ESP32 lee una termocupla y mantiene una temperatura. Un dimmer con TRIAC,
							 disparado con el cruce por cero de la red, maneja la resistencia; un ventilador por
							 PWM se encarga de enfriar.`,
							`El mismo ESP32 corre un servidor WebSocket. Un panel en React se conecta, grafica la
							 temperatura en vivo y te deja cambiar el setpoint, Kp, Ki, Kd y el límite integral
							 con el lazo andando &mdash; o saltearte el lazo y manejar la resistencia y el
							 ventilador a mano.`,
						],
						steps: [
							{ title: 'Medir', note: 'Una termocupla con MAX6675 lee la temperatura.' },
							{ title: 'PID', note: 'El ESP32 calcula cuánto se desvió y cuánto corregir.' },
							{ title: 'Actuar', note: 'Más resistencia por el dimmer, o más ventilador.' },
							{ title: 'Informar', note: 'Cada término del lazo sale por WebSocket.' },
							{ title: 'Ajustar', note: 'El panel lo grafica y manda ganancias nuevas.' },
						],
						tech: ['C++', 'ESP32', 'PlatformIO', 'React', 'WebSockets', 'Plotly'],
						url: `${GH}/PIDwithDimmer`,
					},
					{
						slug: 'bitflipdetector',
						name: 'BitFlipDetector',
						year: '2021',
						kind: 'Experimento',
						tagline: 'Esperando a que un rayo cósmico cambie un bit.',
						body: [
							`Escrito para viajar en una Raspberry Pi colgada de un globo de gran altura, donde
							 hay menos atmósfera entre la memoria y los rayos cósmicos.`,
							`Reserva 850 MB de RAM, la fija para que no pueda irse a swap, la llena de ceros y
							 después suma todos los bytes, una y otra vez. La suma debería quedarse igual para
							 siempre. En el momento en que no, se dio vuelta un bit, y la hora queda anotada en
							 un archivo. Sesenta líneas de C.`,
						],
						steps: [
							{ title: 'Reservar', note: '850 MB, fijados en memoria física.' },
							{ title: 'Poner en cero', note: 'Todos los bytes en 0.' },
							{ title: 'Sumar', note: 'Sumarlos todos. Otra vez. Y otra.' },
							{ title: 'Comparar', note: '¿Cambió el total desde la pasada anterior?' },
							{ title: 'Registrar', note: 'Si cambió: fecha y hora, a un archivo.' },
						],
						tech: ['C', 'Raspberry Pi'],
						url: `${GH}/BitFlipDetector`,
					},
				],
			},
			{
				label: 'Algoritmos',
				projects: [
					{
						slug: 'shortestpathdijkstra',
						name: 'ShortestPathDijkstra',
						year: '2021',
						kind: 'Visualización · proyecto universitario',
						tagline: 'Dibujá un grafo y pedí la ruta más barata.',
						body: [
							`Una sola página HTML, de la materia de Investigación Operativa. Agregás aristas como
							 origen, destino y costo, y el grafo se va dibujando solo. Después elegís dos nodos:
							 corre Dijkstra, marca la ruta y te dice cuánto cuesta el viaje.`,
							`Sigue funcionando: el enlace de abajo es la página misma.`,
						],
						shots: [{ key: 'dijkstra', alt: 'Un grafo dirigido de siete nodos con aristas con peso, sobre una tabla de las aristas y un formulario que informa que el viaje más barato de A a G cuesta 20.' }],
						steps: [
							{ title: 'Agregar aristas', note: 'Origen, destino, costo.' },
							{ title: 'Dibujar', note: 'Cytoscape.js acomoda el grafo.' },
							{ title: 'Preguntar', note: 'Elegís dónde empieza y dónde termina.' },
							{ title: 'Dijkstra', note: 'La ruta más barata, y su total.' },
						],
						tech: ['JavaScript', 'Cytoscape.js', 'Bootstrap'],
						url: `${GH}/ShortestPathDijkstra`,
						demo: 'https://99arrzel.github.io/ShortestPathDijkstra/RutaMasCorta.html',
					},
					{
						slug: 'aoc2024-go',
						name: 'AoC2024-GO',
						year: '2024',
						kind: 'Acertijos',
						tagline: 'Advent of Code 2024, en Go.',
						body: [
							`Mis soluciones del Advent of Code 2024: una carpeta por día, con el input del
							 acertijo al lado del código que se lo come. Están los días 1 al 6 y el 11. Los
							 otros dieciocho, no.`,
						],
						days: [1, 2, 3, 4, 5, 6, 11],
						tech: ['Go'],
						url: `${GH}/AoC2024-GO`,
					},
				],
			},
		],
	},
};
