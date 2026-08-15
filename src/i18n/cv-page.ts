// Copy for the CV Press page shell — everything Astro renders into the HTML.
//
// Kept apart from `src/scripts/cv/i18n.ts`, which holds the strings the app
// needs at runtime: that file is shipped to the browser, and there is no reason
// for the modal's step-by-step prose to ride along in the JS bundle when it is
// already in the markup.

import type { Lang } from './index';
import type { TemplateId } from '../scripts/cv/types';

type CvPageCopy = {
	metaTitle: string;
	metaDescription: string;
	title: string;
	lede: string;
	privacyHtml: string;

	docLabel: string;
	docSwitchAria: string;
	nameLabel: string;
	renameAria: string;
	docNew: string;
	docDup: string;
	docDel: string;
	importMd: string;
	exportMd: string;
	savedState: string;

	editorAria: string;
	previewAria: string;
	tabMarkdown: string;
	tabForm: string;
	tabXray: string;
	tabPreview: string;

	paneNote: string;
	assistBtn: string;
	mdAria: string;
	formatSummary: string;
	formatRulesHtml: string[];
	xrayHeading: string;

	templates: Record<TemplateId, { name: string; blurb: string }>;
	templateAria: string;
	parseRisk: string;
	risk: { none: string; low: string; moderate: string };

	pageLabel: string;
	densityLabel: string;
	density: { tight: string; normal: string; airy: string };
	accentLabel: string;
	printBtn: string;

	qrOn: string;
	qrSize: string;
	qrEvery: string;
	qrHash: string;
	qrHashTitle: string;
	copyLink: string;
	shorten: string;
	unshorten: string;
	qrOff: string;

	tipsTitle: string;
	tipsHtml: string[];
	tipsSub: string;
	tipsDismiss: string;

	modal: {
		title: string;
		lede: string;
		close: string;
		step1Title: string;
		step1Body: string;
		step1Placeholder: string;
		step1Hint: string;
		step2Title: string;
		step2Body: string;
		step2Btn: string;
		step3Title: string;
		step3BodyHtml: string;
		openChatGpt: string;
		openClaude: string;
		step4Title: string;
		step4BodyHtml: string;
		step4Placeholder: string;
		step4Btn: string;
		step4Hint: string;
	};
};

export const cvPage: Record<Lang, CvPageCopy> = {
	en: {
		metaTitle: 'CV Press',
		metaDescription:
			'A CV builder that runs entirely in your browser. Fill in a form, pick a template, print a PDF with a real text layer that an ATS can actually read. Nothing is uploaded.',
		title: 'CV Press',
		lede: 'Fill in the form, pick a template, print to PDF. The output has a real text layer — selectable, searchable, and readable by the systems that index your application.',
		privacyHtml: `<strong>Nothing leaves this tab</strong> — no server, no upload, no account. Your CV is saved in
			this browser's local storage and nowhere else, so export it to a file if you want a backup.
			The single exception is the <em>Shorten via TinyURL</em> button, which asks first and says
			exactly what it sends.`,

		docLabel: 'Document',
		docSwitchAria: 'Switch document',
		nameLabel: 'Name',
		renameAria: 'Rename this document',
		docNew: 'New',
		docDup: 'Duplicate',
		docDel: 'Delete',
		importMd: 'Import .md',
		exportMd: 'Export .md',
		savedState: 'Saved in this browser',

		editorAria: 'Editor',
		previewAria: 'Preview',
		tabMarkdown: 'Markdown',
		tabForm: 'Form',
		tabXray: 'X-ray',
		tabPreview: 'Preview ↓',

		paneNote:
			'The form and this text are the same document. Edit either one. This is also exactly what gets saved and exported.',
		assistBtn: "Don't write this yourself — let ChatGPT or Claude do it",
		mdAria: 'CV markdown source',
		formatSummary: 'The format',
		formatRulesHtml: [
			'<code>##&nbsp;Heading</code> opens a section.',
			'<code>###&nbsp;Role @ Company — Location</code> opens an entry; <code>@</code> and <code>—</code> are optional.',
			'The line under an entry is its dates: <code>Jan 2023 – Present</code>.',
			'<code>-&nbsp;bullet</code> for achievements.',
			'<code>**Label:** value</code> for skills rows.',
			'Anything else stays as prose under its section.',
		],
		xrayHeading: 'What the checks found',

		templates: {
			ledger: { name: 'Ledger', blurb: 'Sans, right-aligned dates, hairline rules.' },
			broadsheet: { name: 'Broadsheet', blurb: 'Serif, generous leading, italic heads.' },
			rail: { name: 'Rail', blurb: 'Tinted sidebar for contact and skills.' },
			plain: { name: 'Plain', blurb: 'No rules, no colour, pure hierarchy.' },
		},
		templateAria: 'Template',
		parseRisk: 'parse risk',
		risk: { none: 'none', low: 'low', moderate: 'moderate' },

		pageLabel: 'Page',
		densityLabel: 'Density',
		density: { tight: 'Tight', normal: 'Normal', airy: 'Airy' },
		accentLabel: 'Accent',
		printBtn: 'Print to PDF',

		qrOn: 'Print a QR carrying the whole CV',
		qrSize: 'Size',
		qrEvery: 'Every page',
		qrHash: 'Use # not ?',
		qrHashTitle: 'Puts the payload after # so it is never sent to a server',
		copyLink: 'Copy share link',
		shorten: 'Shorten via TinyURL',
		unshorten: 'Use self-contained',
		qrOff: 'No code on the page.',

		tipsTitle: 'Two settings in the print dialog',
		tipsHtml: [
			'Turn <b>Headers and footers</b> off, or the browser stamps a URL and date on your CV.',
			'Set <b>Scale</b> to 100% (not “Fit to page”), so the margins come out as designed.',
		],
		tipsSub: 'Then choose “Save as PDF” as the destination.',
		tipsDismiss: 'Got it',

		modal: {
			title: 'Let a chatbot write it for you',
			lede: "You don't have to learn this format. Paste whatever you already have — your LinkedIn page, an old CV, or rough notes — and ChatGPT or Claude will turn it into a CV for you. It takes about two minutes.",
			close: 'Close',
			step1Title: 'Paste anything about yourself',
			step1Body:
				'Go to your LinkedIn profile and select the whole page, or open your old CV and copy everything in it, or just type out your jobs roughly. It does not need to be tidy — making it tidy is the chatbot’s job.',
			step1Placeholder:
				'Paste here. For example:\n\nAna Ruiz, backend engineer in Lisbon, ana@example.com\nNimbus Pay, senior backend engineer, since Feb 2022 — made the settlement job way faster, moved 30 services to Kafka\nTerra Labs 2019 to 2022, built the billing API\nGo, Postgres, AWS, Kubernetes\nCS degree, Universidade de Lisboa, 2015-2019',
			step1Hint: 'This stays in your browser. Nothing is sent anywhere by this box.',
			step2Title: 'Copy the message below',
			step2Body:
				"We already wrote the instructions. Your text from step 1 is added at the bottom of them. Press the button and the whole thing is copied for you — you don't need to select anything.",
			step2Btn: 'Copy the message',
			step3Title: 'Paste it into ChatGPT or Claude',
			step3BodyHtml:
				'Open one of these in a new tab, click the message box, paste (<kbd>Ctrl</kbd>+<kbd>V</kbd>, or <kbd>⌘</kbd>+<kbd>V</kbd> on a Mac), press Enter, and wait for it to finish writing.',
			openChatGpt: 'Open ChatGPT ↗',
			openClaude: 'Open Claude ↗',
			step4Title: 'Copy its whole answer back here',
			step4BodyHtml:
				'Select everything the chatbot replied — from the first <code>---</code> to the very last line — copy it, and paste it in this box. Then press the button.',
			step4Placeholder: "Paste the chatbot's reply here",
			step4Btn: 'Use this as my CV',
			step4Hint: "It's saved as a new document, so whatever you already had here is left alone.",
		},
	},

	es: {
		metaTitle: 'CV Press',
		metaDescription:
			'Un editor de CV que corre entero en tu navegador. Completá un formulario, elegí una plantilla e imprimí un PDF con una capa de texto real que un ATS puede leer de verdad. No se sube nada.',
		title: 'CV Press',
		lede: 'Completá el formulario, elegí una plantilla, imprimí a PDF. El resultado tiene una capa de texto real: seleccionable, buscable y legible por los sistemas que indexan tu postulación.',
		privacyHtml: `<strong>Nada sale de esta pestaña</strong> — sin servidor, sin subidas, sin cuenta. Tu CV se guarda en
			el almacenamiento local de este navegador y en ningún otro lado, así que exportalo a un archivo
			si querés un respaldo. La única excepción es el botón <em>Acortar con TinyURL</em>, que pregunta
			antes y dice exactamente qué envía.`,

		docLabel: 'Documento',
		docSwitchAria: 'Cambiar de documento',
		nameLabel: 'Nombre',
		renameAria: 'Renombrar este documento',
		docNew: 'Nuevo',
		docDup: 'Duplicar',
		docDel: 'Eliminar',
		importMd: 'Importar .md',
		exportMd: 'Exportar .md',
		savedState: 'Guardado en este navegador',

		editorAria: 'Editor',
		previewAria: 'Vista previa',
		tabMarkdown: 'Markdown',
		tabForm: 'Formulario',
		tabXray: 'Rayos X',
		tabPreview: 'Vista previa ↓',

		paneNote:
			'El formulario y este texto son el mismo documento. Editá cualquiera de los dos. Esto es también exactamente lo que se guarda y se exporta.',
		assistBtn: 'No lo escribas vos — que lo haga ChatGPT o Claude',
		mdAria: 'Código markdown del CV',
		formatSummary: 'El formato',
		formatRulesHtml: [
			'<code>##&nbsp;Título</code> abre una sección.',
			'<code>###&nbsp;Puesto @ Empresa — Ubicación</code> abre una entrada; <code>@</code> y <code>—</code> son opcionales.',
			'La línea debajo de una entrada son sus fechas: <code>Ene 2023 – Presente</code>.',
			'<code>-&nbsp;viñeta</code> para los logros.',
			'<code>**Etiqueta:** valor</code> para las filas de habilidades.',
			'Cualquier otra cosa queda como texto corrido dentro de su sección.',
		],
		xrayHeading: 'Lo que encontraron las revisiones',

		templates: {
			ledger: { name: 'Ledger', blurb: 'Sans, fechas alineadas a la derecha, líneas finas.' },
			broadsheet: { name: 'Broadsheet', blurb: 'Serif, interlineado generoso, títulos en itálica.' },
			rail: { name: 'Rail', blurb: 'Barra lateral tintada para contacto y habilidades.' },
			plain: { name: 'Plain', blurb: 'Sin líneas, sin color, pura jerarquía.' },
		},
		templateAria: 'Plantilla',
		parseRisk: 'riesgo de lectura',
		risk: { none: 'nulo', low: 'bajo', moderate: 'moderado' },

		pageLabel: 'Hoja',
		densityLabel: 'Densidad',
		density: { tight: 'Ajustada', normal: 'Normal', airy: 'Aireada' },
		accentLabel: 'Acento',
		printBtn: 'Imprimir a PDF',

		qrOn: 'Imprimir un QR con el CV entero',
		qrSize: 'Tamaño',
		qrEvery: 'En cada página',
		qrHash: 'Usar # en vez de ?',
		qrHashTitle: 'Pone los datos después del # para que nunca lleguen a un servidor',
		copyLink: 'Copiar enlace',
		shorten: 'Acortar con TinyURL',
		unshorten: 'Usar el autocontenido',
		qrOff: 'No hay código en la página.',

		tipsTitle: 'Dos ajustes en el diálogo de impresión',
		tipsHtml: [
			'Desactivá <b>Encabezados y pies de página</b>, o el navegador te estampa una URL y una fecha en el CV.',
			'Poné la <b>Escala</b> en 100% (no “Ajustar a la página”), para que los márgenes salgan como fueron diseñados.',
		],
		tipsSub: 'Después elegí “Guardar como PDF” como destino.',
		tipsDismiss: 'Entendido',

		modal: {
			title: 'Que un chatbot lo escriba por vos',
			lede: 'No hace falta que aprendas este formato. Pegá lo que ya tengas — tu página de LinkedIn, un CV viejo o notas sueltas — y ChatGPT o Claude te lo convierte en un CV. Lleva unos dos minutos.',
			close: 'Cerrar',
			step1Title: 'Pegá cualquier cosa sobre vos',
			step1Body:
				'Andá a tu perfil de LinkedIn y seleccioná la página entera, o abrí tu CV viejo y copiá todo, o escribí tus trabajos así nomás. No hace falta que esté prolijo — ponerlo prolijo es tarea del chatbot.',
			step1Placeholder:
				'Pegá acá. Por ejemplo:\n\nAna Ruiz, ingeniera backend en Lisboa, ana@ejemplo.com\nNimbus Pay, ingeniera backend senior, desde feb 2022 — hizo mucho más rápido el proceso de liquidación, migró 30 servicios a Kafka\nTerra Labs 2019 a 2022, construyó la API de facturación\nGo, Postgres, AWS, Kubernetes\nLicenciatura en Computación, Universidade de Lisboa, 2015-2019',
			step1Hint: 'Esto se queda en tu navegador. Este cuadro no envía nada a ningún lado.',
			step2Title: 'Copiá el mensaje de abajo',
			step2Body:
				'Las instrucciones ya están escritas. Tu texto del paso 1 se agrega al final de ellas. Apretá el botón y se copia todo junto — no hace falta que selecciones nada.',
			step2Btn: 'Copiar el mensaje',
			step3Title: 'Pegalo en ChatGPT o Claude',
			step3BodyHtml:
				'Abrí uno de estos en una pestaña nueva, hacé clic en el cuadro de mensaje, pegá (<kbd>Ctrl</kbd>+<kbd>V</kbd>, o <kbd>⌘</kbd>+<kbd>V</kbd> en una Mac), apretá Enter y esperá a que termine de escribir.',
			openChatGpt: 'Abrir ChatGPT ↗',
			openClaude: 'Abrir Claude ↗',
			step4Title: 'Copiá toda su respuesta de vuelta acá',
			step4BodyHtml:
				'Seleccioná todo lo que respondió el chatbot — desde el primer <code>---</code> hasta la última línea — copialo y pegalo en este cuadro. Después apretá el botón.',
			step4Placeholder: 'Pegá acá la respuesta del chatbot',
			step4Btn: 'Usar esto como mi CV',
			step4Hint: 'Se guarda como documento nuevo, así que lo que ya tenías acá queda intacto.',
		},
	},
};
