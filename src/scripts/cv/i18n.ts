// Runtime strings for the CV app.
//
// The locale is read once from `<html lang>`, which the page already sets, so
// no module has to be handed a language and nothing has to re-render when it
// changes — the language *is* the page you're on.
//
// Interpolated strings are functions rather than templates with placeholders:
// the compiler then checks the call sites, and a translation that forgets an
// argument fails the build instead of printing "undefined" into someone's CV.
//
// What is deliberately NOT translated: the frontmatter keys (`name:`, `title:`,
// `links:` …). They are the storage format — a document written in one language
// has to open in the other, and share links have to survive the trip.

export type CvLang = 'en' | 'es';

function detect(): CvLang {
	// Guard for the build: this module is imported by the Astro page too, where
	// there is no document.
	if (typeof document === 'undefined') return 'en';
	return document.documentElement.lang.toLowerCase().startsWith('es') ? 'es' : 'en';
}

let current: CvLang | null = null;

export function cvLang(): CvLang {
	return (current ??= detect());
}

const EN = {
	form: {
		kinds: {
			entries: 'Entries (jobs, degrees, projects)',
			text: 'Prose',
			skills: 'Labelled rows',
			list: 'Bullet list',
		},
		newSection: 'New section',
		untitledSection: 'Section',
		entryOf: (n: number, total: number) => `Entry ${n} of ${total}`,
		moveUp: 'Move up',
		moveDown: 'Move down',
		removeEntry: 'Remove entry',
		removeBullet: 'Remove bullet',
		removeRow: 'Remove row',
		removeItem: 'Remove item',
		removeLink: 'Remove link',
		moveSectionUp: 'Move section up',
		moveSectionDown: 'Move section down',
		deleteSection: 'Delete section',
		sectionHeading: 'Section heading',
		sectionType: 'Section type',
		inSidebar: 'In sidebar',
		bullets: 'Bullets',
		addBullet: 'Add bullet',
		addEntry: 'Add entry',
		addRow: 'Add row',
		addItem: 'Add item',
		addLink: 'Add link',
		addSection: 'Add section',
		whoYouAre: 'Who you are',
		links: 'Links',
		f: {
			title: 'Title',
			org: 'Organisation',
			from: 'From',
			to: 'To',
			meta: 'Location / notes',
			lead: 'Lead line',
			text: 'Text',
			name: 'Name',
			headline: 'Headline',
			email: 'Email',
			phone: 'Phone',
			location: 'Location',
			extra: 'Extra line',
		},
		ph: {
			role: 'Full Stack Engineer',
			org: 'PostReminder',
			start: 'Jul 2025',
			end: 'Present',
			meta: 'Remote · San Francisco, CA',
			lead: 'Optional prose above the bullets',
			bullet: 'Achievement with a number in it',
			text: 'Blank line between paragraphs.',
			skillKey: 'Languages',
			skillValue: 'TypeScript, Go, SQL',
			item: 'Certification — issuer (2023)',
			name: 'Andrés Carrillo Zelada',
			headline: 'Full-Stack Engineer · Next.js / TypeScript',
			email: 'you@example.com',
			phone: 'Optional',
			location: 'Buenos Aires, Argentina',
			link: 'github.com/you',
			extra: 'Languages, work authorisation, availability…',
		},
		photo: {
			label: 'Photo',
			alt: 'Current profile photo',
			replace: 'Replace',
			add: 'Add photo',
			remove: 'Remove',
			shape: 'Photo shape',
			circle: 'Circle',
			square: 'Square',
			plainNote: 'Plain leaves the photo off by design — switch template to show it. ',
			hint: 'Cropped square and stored in this browser with the rest of the document. Customary in Latin America and much of Europe; usually left off for the US, UK and Canada.',
		},
	},

	render: {
		contact: 'Contact',
		qrCaption: 'Scan to open this CV',
	},

	app: {
		saved: 'Saved in this browser',
		saving: 'Saving…',
		saveFailed: 'Could not save — storage is full or blocked',
		savedWithPhoto: (kb: number) => `Saved · photo is ${kb} KB`,
		pageOne: (fill: number) => `1 page · ${fill}% full`,
		pageMany: (pages: number, fill: number) => `${pages} pages · page ${pages} is ${fill}% full`,
		pageGuide: (n: number) => `page ${n}`,
		atsMeta: (words: number) =>
			`${words} words · this is your CV linearised the way a PDF parser reads it — down the page, then left to right across each row`,
		atsClean: 'Nothing to flag. Contact details, dates and section names all parse.',

		qrNoCompression: 'This browser has no CompressionStream, so the code cannot be built.',
		qrCompressFailed: 'Could not compress the CV for the link.',
		qrTooLong: (chars: number) =>
			`This CV compresses to ${chars} characters — past what any QR symbol can hold. Shorten it.`,
		qrOff: 'No code on the page.',
		qrVerdictBad: 'too dense to scan reliably — make it bigger',
		qrVerdictWarn: 'marginal on most phones — a few mm bigger is safer',
		qrVerdictOk: 'scannable on a modern phone',
		qrVerdictGreat: 'comfortable to scan',
		qrSourceShort: (chars: number) => `short link · ${chars} chars`,
		qrSourceSelf: (chars: number, codec: string) => `self-contained · ${chars} chars of ${codec}`,
		qrReadout: (source: string, version: number, modules: number, mm: string, size: number, verdict: string) =>
			`${source} · QR version ${version} · ${modules}×${modules} modules · ${mm} mm per module at ${size} mm — ${verdict}`,
		shortStale:
			'The CV changed since it was shortened, so the code is using the long link. Shorten again to get the small one back.',
		shortenedTo: (url: string) => `Shortened to ${url}`,
		shortening: 'Shortening…',
		shortenConfirm:
			'Shortening sends this CV — name, contact details and full history — to TinyURL, ' +
			'which is the only thing in this tool that leaves your browser.\n\n' +
			'It buys a much smaller code (about 25 modules instead of 150). The trade is that ' +
			'a printed code then depends on TinyURL still being alive when someone scans it.\n\n' +
			'Continue?',

		noCompressionShare: 'This browser has no CompressionStream, so share links are unavailable.',
		linkCopied: (chars: number) => `Link copied — ${chars} characters, photo not included`,
		linkFailed: 'Could not build or copy the link.',

		untitledDoc: 'Untitled CV',
		copySuffix: (name: string) => `${name} copy`,
		onlyDoc: 'This is your only document. Create another one before deleting this.',
		confirmDelete: (name: string) => `Delete "${name}"? This cannot be undone.`,

		photoUnreadable: 'That image could not be read.',

		promptCopied: 'Copied. Now open ChatGPT or Claude below and paste it.',
		promptCopyBlocked:
			'Your browser blocked the copy button. The text is selected for you — press Ctrl+C (or ⌘+C).',
		promptNotCv: 'That does not look like a CV document.',
		fromChatbot: 'From a chatbot',
		builtFromChatbot: (name: string) =>
			`Built "${name}" from the chatbot's reply and saved it as a new document. ` +
			'Check it over in the form — anything it got wrong is one edit away.',

		sharedDoc: 'Shared CV',
		loadedFromLink: (name: string) =>
			`Loaded ${name} from a link, saved here as a new document. ` +
			'Nothing that was already in this browser was touched.',
		aCv: 'a CV',
		linkUnreadable: 'That link carried a CV this version could not read. Opening your own instead.',
	},

	lint: {
		noName: 'No name.',
		noNameHint: 'The parser uses the largest text on page one to guess who you are.',
		noEmail: 'No email address.',
		noEmailHint:
			'This is the field most systems key a candidate record on. Put it in the body of page one, never in a running header.',
		badEmail: (email: string) => `"${email}" doesn't look like an email address.`,
		noLinks: 'No links.',
		noLinksHint: 'A GitHub or LinkedIn URL is usually the first thing a human clicks.',
		noLocation: 'No location.',
		noLocationHint: 'Many job boards filter on it, and a missing one reads as evasive.',
		plainNoPhoto: 'Plain is not showing your photo.',
		plainNoPhotoHint: 'That template drops it deliberately. Pick another one if you want the portrait.',

		noSections: 'No sections yet.',
		noHeading: 'A section has no heading.',
		oddHeading: (heading: string) => `"${heading}" isn't a heading parsers recognise.`,
		oddHeadingHint:
			'Field mapping keys off standard names — Experience, Education, Skills, Projects, Certifications.',

		untitledEntry: 'an untitled entry',
		entryNoTitle: (heading: string) => `${heading}: an entry has no title.`,
		entryNoOrg: (heading: string, label: string) =>
			`${heading}: "${label}" has no employer or institution.`,
		entryNoDates: (heading: string, label: string) => `${heading}: "${label}" has no dates.`,
		entryNoDatesHint: 'Use "Jan 2023 – Present" so the range parses.',
		longBullet: (heading: string, label: string, n: number) =>
			`${heading}: a bullet under "${label}" runs to ${n} words.`,
		longBulletHint: 'Bullets past ~30 words stop being skimmed. Split it.',
		noNumbers: (heading: string) => `${heading}: no numbers in any bullet.`,
		noNumbersHint: 'Quantified results are what survive a six-second skim.',
		longSummary: (n: number) => `Your summary is ${n} words.`,
		longSummaryHint: 'Three or four sentences is the most anyone reads.',

		tooManyPages: (n: number) => `This runs to ${n} pages.`,
		tooManyPagesHint: 'Two is the practical ceiling. Try a tighter density before cutting content.',
		overOnePageHint: 'Switching density to Tight often pulls it back to one.',
		interleaved: 'Your two columns braid together in the extracted text.',
		interleavedHint:
			'Side by side to a human; read across the rows by a machine. Open the X-ray to see it. For anything going through a job portal, a single-column template parses cleanly.',
		railLong: 'Rail runs past one page.',
		railLongHint:
			'The sidebar tint repeats correctly, but a sidebar longer than the main column leaves a stranded second page. Check the preview guides.',

		qrStale: 'The QR is not using your short link.',
		qrStaleHint:
			'The CV changed after it was shortened, so the code fell back to the long self-contained link. Shorten again, or it will print as a much denser square.',
		qrDense: (mm: string) => `The QR is ${mm} mm per module — too dense to scan.`,
		qrDenseHint:
			'Make it bigger, or shorten the link so the code carries 28 characters instead of a whole CV.',
		qrMarginal: (mm: string) => `The QR is ${mm} mm per module.`,
		qrMarginalHint: 'Under about 0.33 it gets unreliable on older phone cameras.',

		thin: (n: number) => `Only ${n} words of extractable text.`,
		thinHint: 'Thin résumés match fewer searches, whoever is reading.',
		emailMissing: 'Your email is not in the extracted text.',
		emailMissingHint: 'Whatever is rendering it is invisible to a parser.',
	},

	photo: {
		notAnImage: (name: string) => `${name} isn't an image.`,
		noCanvas: 'This browser would not give us a canvas to resize the image on.',
		stillTooBig: 'That image is still too large after resizing. Try a smaller one.',
	},

	tinyurl: {
		unreachable:
			'Could not reach TinyURL. Check the connection, or print the self-contained code instead.',
		status: (code: number) =>
			`TinyURL answered ${code}. The CV may be too long for it — try trimming a section.`,
		refused: (body: string) => `TinyURL refused this link: ${body}`,
	},

	prompt: {
		nothingPasted: '(nothing pasted yet — paste your information in step 1)',
		emptyBox: 'That box is empty — paste the chatbot’s reply into it first.',
		notCv:
			'That doesn’t look like a CV document — there are no "## " section headings in it. Make sure you copied the chatbot’s whole reply.',
		/** Section names suggested to the model, and accepted by the linter. */
		headings: ['Summary', 'Experience', 'Education', 'Skills', 'Projects', 'Certifications'],
		instructions: `You are converting someone's raw career information into a résumé written in ONE specific plain-text format. Your entire reply must be that document and nothing else.

# HARD RULES — these matter more than anything else

1. Reply with the document ONLY. No greeting, no "Here is your CV", no explanation, no summary of what you did, no notes at the end.
2. Do NOT wrap the reply in a code fence. No \`\`\` anywhere. Start your reply with the first "---" line.
3. Use ONLY facts that appear in the information below. Never invent an employer, job title, date, degree, certification, number or skill. If something is not stated, leave that field out entirely rather than guessing.
4. Keep the person's own wording and their language. If their information is in Spanish, write the document in Spanish. Do not translate.
5. Never write placeholder text like "Company Name", "XX years", "[Your email]" or "TODO". If you don't have it, omit the line.
6. Do NOT include a "photo:" line. Photos are handled separately.

# THE FORMAT

The document has two parts: a settings block at the very top between two "---" lines, then the content.

## Part 1 — the block between --- and ---

The key names below are fixed. Write them exactly as shown, in English, whatever language the rest of the document is in. Include only the lines you actually have information for:

---
name: Full name
title: One short line, e.g. Full-Stack Engineer · React / Node / AWS
location: City, Country
email: their@email.com
phone: +00 000 000 000
links:
  - linkedin.com/in/handle
  - github.com/handle
extra: Languages spoken, work authorisation, availability — one line, optional
---

Rules for this block:
- "links" is a list. Each link goes on its own line, indented two spaces, starting with "- ".
- Write links without "https://".
- If there is no phone number, omit the whole phone line. Same for every other key.

## Part 2 — the content

Sections start with "## ". Use these standard names wherever they apply, because automated résumé scanners look for exactly these words:

  ## Summary
  ## Experience
  ## Education
  ## Skills
  ## Projects
  ## Certifications

If you are writing the document in Spanish, use the Spanish equivalents instead — ## Resumen, ## Experiencia, ## Educación, ## Habilidades, ## Proyectos, ## Certificaciones.

### Inside "## Experience", "## Education" and "## Projects"

Every job, degree or project is written as an entry. An entry is a "### " line, then a date line, then bullets:

### Job title @ Employer — Location or arrangement
Jan 2023 – Present

- What they did and what came of it.
- Another achievement, with a number if the information contains one.

Rules for entries:
- The "### " line is: role, then " @ ", then the employer, then " — ", then anything else (city, Remote, Hybrid, Part-time). The " @ " and " — " parts are optional if you don't have that information, but when you do have it, use exactly those separators — a space, the symbol, a space.
- The date line comes immediately after the "### " line, on its own line, with nothing else on it.
- Write dates as "Mon YYYY – Mon YYYY", for example "Mar 2021 – Aug 2024". Use "Present" for a job they still hold. If you only know years, "2021 – 2024" is fine. Use an en dash "–" between them.
- Bullets start with "- ". Aim for 2 to 5 per job, each one sentence, ideally under 30 words.
- Lead bullets with what they achieved rather than what they were responsible for, but do not invent results that are not in the information.
- For a degree, the role is the degree and the employer is the institution: "### Systems Engineering @ Universidad Franz Tamayo".

### Inside "## Skills"

One line per group, with the group name in bold followed by a colon:

**Languages:** TypeScript, JavaScript, Python
**Frontend:** React, Next.js, Tailwind
**Infrastructure:** AWS, Docker, GitHub Actions

### Inside "## Summary"

Just a paragraph of plain text. Three or four sentences at most. No bullets.

### Inside "## Certifications"

One "- " bullet per certificate, including the issuer and year if known.

# A COMPLETE EXAMPLE

This shows the whole shape. Match it exactly.

---
name: Ana Ruiz
title: Backend Engineer · Go / Postgres
location: Lisbon, Portugal
email: ana@example.com
links:
  - github.com/anaruiz
---

## Summary

Backend engineer with six years on payment systems, mostly Go and Postgres.

## Experience

### Senior Backend Engineer @ Nimbus Pay — Lisbon
Feb 2022 – Present

- Cut settlement job runtime from 40 minutes to under 4 by batching ledger writes.
- Led the migration of 30 services from RabbitMQ to Kafka with no downtime.

### Backend Engineer @ Terra Labs — Remote
Jun 2019 – Jan 2022

- Built the billing API that now processes 2 million invoices a month.

## Skills

**Languages:** Go, Python, SQL
**Infrastructure:** AWS, Kubernetes, Terraform

## Education

### BSc Computer Science @ Universidade de Lisboa
2015 – 2019

# NOW DO IT

Convert the information between the markers below into that format. Remember: reply with the document only, starting with "---", with no code fence and no commentary.`,
	},
};

// No `as const`: the literal types it would infer are what every string in the
// Spanish table would then have to match exactly. Structural checking is what's
// wanted here — a missing or misspelled key must fail, the wording must not.
type Strings = typeof EN;

const ES: Strings = {
	form: {
		kinds: {
			entries: 'Entradas (empleos, títulos, proyectos)',
			text: 'Texto',
			skills: 'Filas con etiqueta',
			list: 'Lista de viñetas',
		},
		newSection: 'Sección nueva',
		untitledSection: 'Sección',
		entryOf: (n: number, total: number) => `Entrada ${n} de ${total}`,
		moveUp: 'Subir',
		moveDown: 'Bajar',
		removeEntry: 'Quitar entrada',
		removeBullet: 'Quitar viñeta',
		removeRow: 'Quitar fila',
		removeItem: 'Quitar ítem',
		removeLink: 'Quitar enlace',
		moveSectionUp: 'Subir sección',
		moveSectionDown: 'Bajar sección',
		deleteSection: 'Eliminar sección',
		sectionHeading: 'Título de la sección',
		sectionType: 'Tipo de sección',
		inSidebar: 'En la barra lateral',
		bullets: 'Viñetas',
		addBullet: 'Agregar viñeta',
		addEntry: 'Agregar entrada',
		addRow: 'Agregar fila',
		addItem: 'Agregar ítem',
		addLink: 'Agregar enlace',
		addSection: 'Agregar sección',
		whoYouAre: 'Quién sos',
		links: 'Enlaces',
		f: {
			title: 'Puesto',
			org: 'Organización',
			from: 'Desde',
			to: 'Hasta',
			meta: 'Ubicación / notas',
			lead: 'Línea de entrada',
			text: 'Texto',
			name: 'Nombre',
			headline: 'Titular',
			email: 'Email',
			phone: 'Teléfono',
			location: 'Ubicación',
			extra: 'Línea extra',
		},
		ph: {
			role: 'Ingeniero Full Stack',
			org: 'PostReminder',
			start: 'Jul 2025',
			end: 'Presente',
			meta: 'Remoto · San Francisco, CA',
			lead: 'Texto opcional arriba de las viñetas',
			bullet: 'Un logro que incluya un número',
			text: 'Una línea en blanco entre párrafos.',
			skillKey: 'Lenguajes',
			skillValue: 'TypeScript, Go, SQL',
			item: 'Certificación — emisor (2023)',
			name: 'Andrés Carrillo Zelada',
			headline: 'Ingeniero Full-Stack · Next.js / TypeScript',
			email: 'vos@ejemplo.com',
			phone: 'Opcional',
			location: 'Buenos Aires, Argentina',
			link: 'github.com/vos',
			extra: 'Idiomas, permiso de trabajo, disponibilidad…',
		},
		photo: {
			label: 'Foto',
			alt: 'Foto de perfil actual',
			replace: 'Reemplazar',
			add: 'Agregar foto',
			remove: 'Quitar',
			shape: 'Forma de la foto',
			circle: 'Círculo',
			square: 'Cuadrado',
			plainNote: 'Plain deja la foto afuera a propósito — cambiá de plantilla para mostrarla. ',
			hint: 'Se recorta cuadrada y se guarda en este navegador junto con el resto del documento. Es habitual en América Latina y buena parte de Europa; para Estados Unidos, Reino Unido y Canadá suele omitirse.',
		},
	},

	render: {
		contact: 'Contacto',
		qrCaption: 'Escaneá para abrir este CV',
	},

	app: {
		saved: 'Guardado en este navegador',
		saving: 'Guardando…',
		saveFailed: 'No se pudo guardar — el almacenamiento está lleno o bloqueado',
		savedWithPhoto: (kb: number) => `Guardado · la foto pesa ${kb} KB`,
		pageOne: (fill: number) => `1 página · ${fill}% ocupada`,
		pageMany: (pages: number, fill: number) =>
			`${pages} páginas · la página ${pages} está ${fill}% ocupada`,
		pageGuide: (n: number) => `página ${n}`,
		atsMeta: (words: number) =>
			`${words} palabras · así queda tu CV linealizado, tal como lo lee un parser de PDF: hacia abajo por la página, y de izquierda a derecha en cada fila`,
		atsClean: 'Nada que marcar. Los datos de contacto, las fechas y los nombres de sección se leen bien.',

		qrNoCompression: 'Este navegador no tiene CompressionStream, así que no se puede generar el código.',
		qrCompressFailed: 'No se pudo comprimir el CV para el enlace.',
		qrTooLong: (chars: number) =>
			`Este CV se comprime a ${chars} caracteres — más de lo que cualquier símbolo QR puede contener. Acortalo.`,
		qrOff: 'No hay código en la página.',
		qrVerdictBad: 'demasiado denso para escanear con fiabilidad — hacelo más grande',
		qrVerdictWarn: 'justo para la mayoría de los teléfonos — unos mm más es más seguro',
		qrVerdictOk: 'escaneable con un teléfono moderno',
		qrVerdictGreat: 'cómodo de escanear',
		qrSourceShort: (chars: number) => `enlace corto · ${chars} caracteres`,
		qrSourceSelf: (chars: number, codec: string) =>
			`autocontenido · ${chars} caracteres de ${codec}`,
		qrReadout: (source: string, version: number, modules: number, mm: string, size: number, verdict: string) =>
			`${source} · QR versión ${version} · ${modules}×${modules} módulos · ${mm} mm por módulo a ${size} mm — ${verdict}`,
		shortStale:
			'El CV cambió desde que se acortó, así que el código está usando el enlace largo. Acortalo de nuevo para recuperar el chico.',
		shortenedTo: (url: string) => `Acortado a ${url}`,
		shortening: 'Acortando…',
		shortenConfirm:
			'Acortar envía este CV — nombre, datos de contacto e historial completo — a TinyURL, ' +
			'que es lo único de esta herramienta que sale de tu navegador.\n\n' +
			'A cambio conseguís un código mucho más chico (unos 25 módulos en vez de 150). El costo es que ' +
			'un código impreso pasa a depender de que TinyURL siga vivo cuando alguien lo escanee.\n\n' +
			'¿Continuar?',

		noCompressionShare:
			'Este navegador no tiene CompressionStream, así que los enlaces para compartir no están disponibles.',
		linkCopied: (chars: number) => `Enlace copiado — ${chars} caracteres, sin la foto`,
		linkFailed: 'No se pudo generar ni copiar el enlace.',

		untitledDoc: 'CV sin título',
		copySuffix: (name: string) => `${name} (copia)`,
		onlyDoc: 'Este es tu único documento. Creá otro antes de borrar este.',
		confirmDelete: (name: string) => `¿Eliminar "${name}"? Esto no se puede deshacer.`,

		photoUnreadable: 'No se pudo leer esa imagen.',

		promptCopied: 'Copiado. Ahora abrí ChatGPT o Claude acá abajo y pegalo.',
		promptCopyBlocked:
			'Tu navegador bloqueó el botón de copiar. El texto ya está seleccionado — apretá Ctrl+C (o ⌘+C).',
		promptNotCv: 'Eso no parece un documento de CV.',
		fromChatbot: 'Del chatbot',
		builtFromChatbot: (name: string) =>
			`Se armó "${name}" con la respuesta del chatbot y se guardó como documento nuevo. ` +
			'Revisalo en el formulario — cualquier cosa que haya errado está a una edición de distancia.',

		sharedDoc: 'CV compartido',
		loadedFromLink: (name: string) =>
			`Se cargó ${name} desde un enlace y se guardó acá como documento nuevo. ` +
			'No se tocó nada de lo que ya estaba en este navegador.',
		aCv: 'un CV',
		linkUnreadable:
			'Ese enlace traía un CV que esta versión no pudo leer. Abrimos el tuyo en su lugar.',
	},

	lint: {
		noName: 'Falta el nombre.',
		noNameHint: 'El parser usa el texto más grande de la página uno para adivinar quién sos.',
		noEmail: 'Falta la dirección de email.',
		noEmailHint:
			'Es el campo con el que la mayoría de los sistemas identifica una candidatura. Ponelo en el cuerpo de la página uno, nunca en un encabezado repetido.',
		badEmail: (email: string) => `"${email}" no parece una dirección de email.`,
		noLinks: 'No hay enlaces.',
		noLinksHint: 'Una URL de GitHub o LinkedIn suele ser lo primero que una persona hace clic.',
		noLocation: 'Falta la ubicación.',
		noLocationHint: 'Muchos portales de empleo filtran por ella, y su ausencia se lee como evasiva.',
		plainNoPhoto: 'Plain no está mostrando tu foto.',
		plainNoPhotoHint:
			'Esa plantilla la deja afuera a propósito. Elegí otra si querés que aparezca el retrato.',

		noSections: 'Todavía no hay secciones.',
		noHeading: 'Una sección no tiene título.',
		oddHeading: (heading: string) => `"${heading}" no es un título que los parsers reconozcan.`,
		oddHeadingHint:
			'El mapeo de campos se basa en nombres estándar — Experiencia, Educación, Habilidades, Proyectos, Certificaciones.',

		untitledEntry: 'una entrada sin título',
		entryNoTitle: (heading: string) => `${heading}: una entrada no tiene puesto.`,
		entryNoOrg: (heading: string, label: string) =>
			`${heading}: "${label}" no tiene empleador ni institución.`,
		entryNoDates: (heading: string, label: string) => `${heading}: "${label}" no tiene fechas.`,
		entryNoDatesHint: 'Usá "Ene 2023 – Presente" para que el rango se interprete bien.',
		longBullet: (heading: string, label: string, n: number) =>
			`${heading}: una viñeta de "${label}" llega a ${n} palabras.`,
		longBulletHint: 'Pasadas las ~30 palabras, las viñetas dejan de leerse en diagonal. Partila.',
		noNumbers: (heading: string) => `${heading}: ninguna viñeta tiene números.`,
		noNumbersHint: 'Los resultados cuantificados son los que sobreviven a una lectura de seis segundos.',
		longSummary: (n: number) => `Tu resumen tiene ${n} palabras.`,
		longSummaryHint: 'Tres o cuatro oraciones es todo lo que alguien llega a leer.',

		tooManyPages: (n: number) => `Esto ocupa ${n} páginas.`,
		tooManyPagesHint:
			'Dos es el techo práctico. Probá bajar la densidad a Ajustada antes de recortar contenido.',
		// "Ajustada" is what the density dropdown says in Spanish — the hint has to
		// name the control the reader is actually looking at.
		overOnePageHint: 'Pasar la densidad a Ajustada suele devolverlo a una sola página.',
		interleaved: 'Tus dos columnas se entrelazan en el texto extraído.',
		interleavedHint:
			'Lado a lado para una persona; leído fila por fila por una máquina. Abrí los rayos X para verlo. Para cualquier cosa que pase por un portal de empleo, una plantilla de una sola columna se interpreta sin problemas.',
		railLong: 'Rail se pasa de una página.',
		railLongHint:
			'El tinte de la barra lateral se repite bien, pero una barra más larga que la columna principal deja una segunda página huérfana. Mirá las guías de la vista previa.',

		qrStale: 'El QR no está usando tu enlace corto.',
		qrStaleHint:
			'El CV cambió después de acortarlo, así que el código volvió al enlace largo autocontenido. Acortalo de nuevo, o se imprimirá como un cuadrado mucho más denso.',
		qrDense: (mm: string) => `El QR tiene ${mm} mm por módulo — demasiado denso para escanear.`,
		qrDenseHint:
			'Hacelo más grande, o acortá el enlace para que el código lleve 28 caracteres en vez de un CV entero.',
		qrMarginal: (mm: string) => `El QR tiene ${mm} mm por módulo.`,
		qrMarginalHint: 'Por debajo de 0,33 se vuelve poco fiable en cámaras de teléfonos viejos.',

		thin: (n: number) => `Solo ${n} palabras de texto extraíble.`,
		thinHint: 'Los CV escuetos coinciden con menos búsquedas, quienquiera que esté leyendo.',
		emailMissing: 'Tu email no aparece en el texto extraído.',
		emailMissingHint: 'Lo que sea que lo esté dibujando es invisible para un parser.',
	},

	photo: {
		notAnImage: (name: string) => `${name} no es una imagen.`,
		noCanvas: 'Este navegador no nos dio un canvas para redimensionar la imagen.',
		stillTooBig: 'Esa imagen sigue siendo muy grande después de redimensionarla. Probá con una más chica.',
	},

	tinyurl: {
		unreachable:
			'No se pudo conectar con TinyURL. Revisá la conexión, o imprimí el código autocontenido.',
		status: (code: number) =>
			`TinyURL respondió ${code}. Puede que el CV sea demasiado largo — probá recortando una sección.`,
		refused: (body: string) => `TinyURL rechazó este enlace: ${body}`,
	},

	prompt: {
		nothingPasted: '(todavía no pegaste nada — pegá tu información en el paso 1)',
		emptyBox: 'Ese cuadro está vacío — pegá ahí la respuesta del chatbot primero.',
		notCv:
			'Eso no parece un documento de CV — no tiene títulos de sección con "## ". Fijate que hayas copiado la respuesta completa del chatbot.',
		headings: ['Resumen', 'Experiencia', 'Educación', 'Habilidades', 'Proyectos', 'Certificaciones'],
		instructions: `Vas a convertir la información laboral en bruto de una persona en un currículum escrito en UN formato de texto plano específico. Toda tu respuesta debe ser ese documento y nada más.

# REGLAS DURAS — importan más que cualquier otra cosa

1. Respondé SOLO con el documento. Sin saludo, sin "Acá está tu CV", sin explicación, sin resumen de lo que hiciste, sin notas al final.
2. NO envuelvas la respuesta en un bloque de código. Nada de \`\`\` en ningún lado. Empezá tu respuesta con la primera línea "---".
3. Usá SOLO datos que aparezcan en la información de abajo. Nunca inventes un empleador, un puesto, una fecha, un título, una certificación, un número ni una habilidad. Si algo no está dicho, dejá ese campo afuera en vez de adivinarlo.
4. Conservá las palabras de la persona y su idioma. Si su información está en español, escribí el documento en español. No traduzcas.
5. Nunca escribas texto de relleno como "Nombre de la empresa", "XX años", "[Tu email]" o "TODO". Si no lo tenés, omití la línea.
6. NO incluyas una línea "photo:". Las fotos se manejan aparte.

# EL FORMATO

El documento tiene dos partes: un bloque de ajustes arriba de todo, entre dos líneas "---", y después el contenido.

## Parte 1 — el bloque entre --- y ---

Los nombres de las claves de abajo son fijos. Escribilos exactamente como se muestran, en inglés, sea cual sea el idioma del resto del documento. Incluí solo las líneas de las que realmente tengas información:

---
name: Nombre completo
title: Una línea corta, por ejemplo Ingeniero Full-Stack · React / Node / AWS
location: Ciudad, País
email: su@email.com
phone: +00 000 000 000
links:
  - linkedin.com/in/usuario
  - github.com/usuario
extra: Idiomas, permiso de trabajo, disponibilidad — una línea, opcional
---

Reglas de este bloque:
- "links" es una lista. Cada enlace va en su propia línea, con dos espacios de sangría, empezando con "- ".
- Escribí los enlaces sin "https://".
- Si no hay teléfono, omití la línea phone entera. Lo mismo para cualquier otra clave.

## Parte 2 — el contenido

Las secciones empiezan con "## ". Usá estos nombres estándar donde correspondan, porque los sistemas automáticos de lectura de currículums buscan exactamente estas palabras:

  ## Resumen
  ## Experiencia
  ## Educación
  ## Habilidades
  ## Proyectos
  ## Certificaciones

Si escribís el documento en inglés, usá los equivalentes en inglés — ## Summary, ## Experience, ## Education, ## Skills, ## Projects, ## Certifications.

### Dentro de "## Experiencia", "## Educación" y "## Proyectos"

Cada empleo, título o proyecto se escribe como una entrada. Una entrada es una línea "### ", después una línea de fechas, después viñetas:

### Puesto @ Empleador — Ubicación o modalidad
Ene 2023 – Presente

- Qué hizo y qué resultó de eso.
- Otro logro, con un número si la información contiene alguno.

Reglas de las entradas:
- La línea "### " es: el puesto, después " @ ", después el empleador, después " — ", y después cualquier otra cosa (ciudad, Remoto, Híbrido, Medio tiempo). Las partes " @ " y " — " son opcionales si no tenés esa información, pero cuando la tenés, usá exactamente esos separadores: un espacio, el símbolo, un espacio.
- La línea de fechas va inmediatamente después de la línea "### ", sola en su renglón, sin nada más.
- Escribí las fechas como "Mes AAAA – Mes AAAA", por ejemplo "Mar 2021 – Ago 2024". Usá "Presente" para un empleo que sigue vigente. Si solo sabés los años, "2021 – 2024" está bien. Usá una raya "–" entre ambos.
- Las viñetas empiezan con "- ". Apuntá a entre 2 y 5 por empleo, cada una de una oración, idealmente de menos de 30 palabras.
- Empezá las viñetas por lo que logró, más que por lo que tenía a cargo, pero no inventes resultados que no estén en la información.
- Para un título, el puesto es la carrera y el empleador es la institución: "### Ingeniería de Sistemas @ Universidad Franz Tamayo".

### Dentro de "## Habilidades"

Una línea por grupo, con el nombre del grupo en negrita seguido de dos puntos:

**Lenguajes:** TypeScript, JavaScript, Python
**Frontend:** React, Next.js, Tailwind
**Infraestructura:** AWS, Docker, GitHub Actions

### Dentro de "## Resumen"

Solo un párrafo de texto plano. Tres o cuatro oraciones como mucho. Sin viñetas.

### Dentro de "## Certificaciones"

Una viñeta "- " por certificado, incluyendo el emisor y el año si se conocen.

# UN EJEMPLO COMPLETO

Esto muestra la forma entera. Igualala exactamente.

---
name: Ana Ruiz
title: Ingeniera Backend · Go / Postgres
location: Lisboa, Portugal
email: ana@ejemplo.com
links:
  - github.com/anaruiz
---

## Resumen

Ingeniera backend con seis años en sistemas de pago, sobre todo Go y Postgres.

## Experiencia

### Ingeniera Backend Senior @ Nimbus Pay — Lisboa
Feb 2022 – Presente

- Bajó el tiempo del proceso de liquidación de 40 minutos a menos de 4 agrupando las escrituras del libro mayor.
- Lideró la migración de 30 servicios de RabbitMQ a Kafka sin caídas.

### Ingeniera Backend @ Terra Labs — Remoto
Jun 2019 – Ene 2022

- Construyó la API de facturación que hoy procesa 2 millones de facturas por mes.

## Habilidades

**Lenguajes:** Go, Python, SQL
**Infraestructura:** AWS, Kubernetes, Terraform

## Educación

### Licenciatura en Ciencias de la Computación @ Universidade de Lisboa
2015 – 2019

# AHORA HACELO

Convertí la información que está entre los marcadores de abajo a ese formato. Recordá: respondé solo con el documento, empezando por "---", sin bloque de código y sin comentarios.`,
	},
};

const STRINGS: Record<CvLang, Strings> = { en: EN as unknown as Strings, es: ES };

/** The strings for the page's language. */
export function s(): Strings {
	return STRINGS[cvLang()];
}
