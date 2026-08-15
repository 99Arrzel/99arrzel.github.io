// Copy for the Failed interviews page.
//
// The code snippets carry their comments in the page's language — a snippet is
// read alongside the answer, so leaving the comments in English inside a
// Spanish explanation reads worse than translating them. The code itself is
// identical in both.

import type { Lang } from './index';

export type Question = {
	prompt: string;
	answer: string;
	topic: string;
	tags: string[];
	slip?: string;
	heard?: string;
	snippet?: string;
};

export type Interview = {
	company: string;
	role: string;
	date: string;
	sub?: string;
	questions: Question[];
};

type InterviewsCopy = {
	metaTitle: string;
	metaDescription: string;
	title: string;
	intro: string;
	introEmphasis: string;
	introTail: string;
	filterAria: string;
	all: string;
	empty: string;
	/** `{n}` questions on `{topic}` — assembled client-side by the filter. */
	showing: { one: string; many: string };
	oneInterview: { one: string; many: string };
	answerLabel: string;
	heardAnswerLabel: string;
	slipLabel: string;
	heardLabel: string;
	interviews: Interview[];
};

export const interviews: Record<Lang, InterviewsCopy> = {
	en: {
		metaTitle: 'Failed interviews',
		metaDescription:
			'Interview questions I fumbled, the honest postmortem, and the answer I should have given.',
		title: 'Failed interviews',
		intro: 'Receipts of questions I fumbled, kept in public so I never fumble them twice. Each one ships with the answer I ',
		introEmphasis: 'should',
		introTail: ' have given.',
		filterAria: 'Filter questions by topic',
		all: 'All',
		empty: 'No questions match that topic yet.',
		showing: {
			one: 'Showing {n} question on {topic}.',
			many: 'Showing {n} questions on {topic}.',
		},
		oneInterview: {
			one: 'One interview · {n} question I should have nailed',
			many: 'One interview · {n} questions I should have nailed',
		},
		answerLabel: "The answer I should've given",
		heardAnswerLabel: 'What it actually is',
		slipLabel: 'Where I slipped:',
		heardLabel: 'Where I heard it:',
		interviews: [
			{
				company: 'Sweatworks',
				role: 'TypeScript Engineer',
				date: 'May 2026',
				questions: [
					{
						prompt: 'What are closures?',
						slip: 'I answered "a function inside a function." That just describes a nested function — basically a callback — not a closure. I even framed it as a function that takes a parameter, which isn\'t the point at all. Then I really went for it and called array methods like map, forEach and reduce "examples of closures" — they\'re not. Those are higher-order functions; the callback you hand them is only a closure if it captures variables from the surrounding scope. The part I missed is that a closure is defined by retaining state from its enclosing scope, not by being nested.',
						answer:
							"A closure is a function bundled together with references to its surrounding lexical scope. The defining trait isn't the nesting — it's that the inner function keeps access to the outer function's variables even after the outer function has returned, and can read and update that captured state across calls. A nested function (or a callback) only becomes a closure once it actually closes over (remembers) state from its enclosing scope. That retained, private state is the whole point. And array methods like map, forEach or reduce aren't closures either — they're higher-order functions (functions that take a callback); the callback is a closure only when it reaches for variables outside itself.",
						snippet: `function counter() {
  let count = 0;          // captured by the closure
  return () => ++count;   // remembers \`count\` after counter() returns
}
const next = counter();
next(); // 1
next(); // 2  ← state persisted via the closure`,
						topic: 'JavaScript',
						tags: ['Closures', 'Lexical scope', 'Higher-order functions', 'JavaScript'],
					},
					{
						prompt: 'Is JavaScript single-threaded or multi-threaded?',
						slip: 'I said "single-threaded," then tried to back it up with the event loop and fumbled it. I called the event loop "a queue" and stopped there — true, but I never explained why it\'s a queue, how it actually works, or how that ties back to there being a single thread. A vague half-answer lands worse than a confident "yes, single-threaded" would have.',
						answer:
							"JavaScript runs on a single main thread with one call stack, so it executes one thing at a time. The event loop is what keeps that single thread responsive: it runs the current task to completion, while anything asynchronous — timers, I/O, fetch, DOM events — is handed off to the host (the browser, or Node via libuv), which does that work elsewhere and pushes a callback onto a queue when it's done. There are actually two tiers: the macrotask queue (setTimeout, I/O, UI events) and the microtask queue (Promise callbacks, queueMicrotask). The loop only pulls the next callback once the call stack is empty, and it drains all microtasks before the next macrotask. That ordering — and the fact that one long synchronous block freezes everything — is exactly why it's a queue and not parallel execution. For real parallelism you step outside the language: Web Workers (browser) and Worker Threads (Node) run on separate OS threads and communicate by message passing, with SharedArrayBuffer + Atomics for shared memory. So: single-threaded execution model, concurrency via the event loop, true multithreading via workers.",
						snippet: `console.log('1: sync');                          // runs now, on the stack
setTimeout(() => console.log('4: macrotask'), 0); // queued as a macrotask
Promise.resolve().then(() => console.log('3: microtask'));
console.log('2: sync');
// → 1, 2, 3, 4
// stack empties → drain ALL microtasks (3) → then the next macrotask (4)`,
						topic: 'Concurrency',
						tags: ['Event loop', 'Microtasks', 'Web Workers', 'Concurrency'],
					},
				],
			},
			{
				company: 'Overheard',
				role: 'Web3 Developer interviews',
				date: 'Jun 2026',
				sub: 'Not an interview I sat — a question doing the rounds online that I wanted to actually understand.',
				questions: [
					{
						prompt: 'What is a Merkle tree?',
						heard:
							"This one isn't a question I was asked — I'm not a web3 dev and I never applied. I just kept reading people hiring for web3 roles griping that juniors couldn't explain what a Merkle tree is. So I read an article on it out of curiosity, and the idea of hashing pairs of children over and over to build a tree was too neat to leave off this page.",
						answer:
							'A Merkle tree (or hash tree) is a tree built entirely out of hashes. You split your data into chunks and hash each one — those hashes are the leaves. Then you pair the leaves up, concatenate each pair and hash it to get their parent, and repeat that one level at a time, hashing pairs of children into a single parent, until you\'re left with one hash at the very top: the Merkle root. That root is a compact fingerprint of the whole dataset — flip a single byte in any leaf and its hash changes, which changes its parent, and that ripples all the way up to the root. The payoff is twofold: it\'s tamper-evident (any change is visible at the root), and it gives cheap membership proofs. To prove one chunk is in the set you don\'t need the whole set — just the sibling hash at each level on the path from your leaf up to the root (a "Merkle proof"), which is only about log₂(n) hashes for n leaves. Anyone holding the trusted root can recompute it from your chunk plus those siblings and confirm it matches. That\'s exactly how a Bitcoin or Ethereum light client checks a transaction is in a block without downloading the whole block, and the same idea underpins Git, IPFS and Certificate Transparency. (Detail worth knowing: when a level has an odd number of nodes, most implementations — Bitcoin included — just duplicate the last hash so it can still be paired.)',
						snippet: `import { createHash } from 'node:crypto';
const sha = (s) => createHash('sha256').update(s).digest('hex');

// 1. hash each chunk of data → these are the leaves
let level = ['a', 'b', 'c', 'd'].map(sha);

// 2. hash pairs of children into a parent, repeat up to the top
while (level.length > 1) {
  const next = [];
  for (let i = 0; i < level.length; i += 2) {
    const left = level[i];
    const right = level[i + 1] ?? left; // odd one out? pair it with itself
    next.push(sha(left + right));
  }
  level = next;
}

const root = level[0]; // change ANY leaf and this root changes`,
						topic: 'Web3',
						tags: ['Merkle tree', 'Hashing', 'Blockchain', 'Data structures'],
					},
				],
			},
		],
	},
	es: {
		metaTitle: 'Entrevistas fallidas',
		metaDescription:
			'Preguntas de entrevista que respondí mal, la autopsia honesta, y la respuesta que debería haber dado.',
		title: 'Entrevistas fallidas',
		intro: 'Constancia de las preguntas que respondí mal, en público para no volver a errarlas. Cada una viene con la respuesta que ',
		introEmphasis: 'debería',
		introTail: ' haber dado.',
		filterAria: 'Filtrar preguntas por tema',
		all: 'Todas',
		empty: 'Todavía no hay preguntas de ese tema.',
		showing: {
			one: 'Mostrando {n} pregunta de {topic}.',
			many: 'Mostrando {n} preguntas de {topic}.',
		},
		oneInterview: {
			one: 'Una entrevista · {n} pregunta que debería haber clavado',
			many: 'Una entrevista · {n} preguntas que debería haber clavado',
		},
		answerLabel: 'La respuesta que debería haber dado',
		heardAnswerLabel: 'Qué es en realidad',
		slipLabel: 'Dónde me equivoqué:',
		heardLabel: 'Dónde la escuché:',
		interviews: [
			{
				company: 'Sweatworks',
				role: 'TypeScript Engineer',
				date: 'May 2026',
				questions: [
					{
						prompt: '¿Qué son los closures?',
						slip: 'Respondí "una función dentro de otra función". Eso describe una función anidada — básicamente un callback — no un closure. Encima lo planteé como una función que recibe un parámetro, que no tiene nada que ver. Y después me mandé del todo y dije que métodos de array como map, forEach y reduce eran "ejemplos de closures" — no lo son. Esos son funciones de orden superior; el callback que les pasás es un closure solo si captura variables del ámbito que lo rodea. Lo que se me escapó es que un closure se define por retener estado de su ámbito envolvente, no por estar anidado.',
						answer:
							'Un closure es una función empaquetada junto con las referencias a su ámbito léxico circundante. El rasgo que lo define no es el anidamiento: es que la función interna conserva acceso a las variables de la función externa incluso después de que esta ya retornó, y puede leer y actualizar ese estado capturado entre llamadas. Una función anidada (o un callback) recién se vuelve un closure cuando efectivamente "cierra sobre" (recuerda) estado de su ámbito envolvente. Ese estado retenido y privado es el punto central. Y los métodos de array como map, forEach o reduce tampoco son closures: son funciones de orden superior (funciones que reciben un callback); el callback es un closure solo cuando busca variables fuera de sí mismo.',
						snippet: `function contador() {
  let cuenta = 0;           // capturada por el closure
  return () => ++cuenta;    // recuerda \`cuenta\` después de que contador() retornó
}
const siguiente = contador();
siguiente(); // 1
siguiente(); // 2  ← el estado persistió gracias al closure`,
						topic: 'JavaScript',
						tags: ['Closures', 'Ámbito léxico', 'Funciones de orden superior', 'JavaScript'],
					},
					{
						prompt: '¿JavaScript es de un solo hilo o multihilo?',
						slip: 'Dije "de un solo hilo" y después traté de respaldarlo con el event loop y me trabé. Llamé al event loop "una cola" y me quedé ahí — es cierto, pero nunca expliqué por qué es una cola, cómo funciona en realidad, ni cómo eso se conecta con que haya un solo hilo. Media respuesta vaga cae peor que un "sí, un solo hilo" dicho con seguridad.',
						answer:
							'JavaScript corre sobre un único hilo principal con una sola pila de llamadas, así que ejecuta una cosa a la vez. El event loop es lo que mantiene responsivo a ese único hilo: ejecuta la tarea actual hasta terminarla, mientras que todo lo asíncrono — temporizadores, E/S, fetch, eventos del DOM — se delega al entorno anfitrión (el navegador, o Node vía libuv), que hace ese trabajo por fuera y encola un callback cuando termina. En realidad hay dos niveles: la cola de macrotareas (setTimeout, E/S, eventos de interfaz) y la cola de microtareas (callbacks de promesas, queueMicrotask). El loop recién toma el siguiente callback cuando la pila de llamadas está vacía, y vacía todas las microtareas antes de pasar a la próxima macrotarea. Ese orden — y el hecho de que un bloque síncrono largo congela todo — es exactamente por qué es una cola y no ejecución en paralelo. Para paralelismo real hay que salir del lenguaje: los Web Workers (navegador) y los Worker Threads (Node) corren en hilos del sistema operativo separados y se comunican por paso de mensajes, con SharedArrayBuffer + Atomics para memoria compartida. Entonces: modelo de ejecución de un solo hilo, concurrencia vía event loop, multihilo real vía workers.',
						snippet: `console.log('1: síncrono');                        // corre ahora, en la pila
setTimeout(() => console.log('4: macrotarea'), 0);  // encolado como macrotarea
Promise.resolve().then(() => console.log('3: microtarea'));
console.log('2: síncrono');
// → 1, 2, 3, 4
// la pila se vacía → drena TODAS las microtareas (3) → luego la macrotarea (4)`,
						topic: 'Concurrencia',
						tags: ['Event loop', 'Microtareas', 'Web Workers', 'Concurrencia'],
					},
				],
			},
			{
				company: 'De oídas',
				role: 'Entrevistas de desarrollador Web3',
				date: 'Jun 2026',
				sub: 'No es una entrevista que di — es una pregunta que circulaba por internet y que quise entender de verdad.',
				questions: [
					{
						prompt: '¿Qué es un árbol de Merkle?',
						heard:
							'Esta no es una pregunta que me hayan hecho: no soy desarrollador web3 y nunca me postulé. Simplemente leía una y otra vez a gente contratando para puestos de web3 quejándose de que los juniors no sabían explicar qué es un árbol de Merkle. Así que leí un artículo por curiosidad, y la idea de ir hasheando pares de hijos una y otra vez para armar un árbol me pareció demasiado linda como para dejarla fuera de esta página.',
						answer:
							'Un árbol de Merkle (o árbol de hashes) es un árbol construido enteramente a partir de hashes. Dividís tus datos en fragmentos y hasheás cada uno: esos hashes son las hojas. Después emparejás las hojas, concatenás cada par y lo hasheás para obtener su padre, y repetís nivel por nivel, hasheando pares de hijos en un único padre, hasta quedarte con un solo hash arriba de todo: la raíz de Merkle. Esa raíz es una huella compacta de todo el conjunto de datos — cambiá un solo byte en cualquier hoja y su hash cambia, lo que cambia su padre, y eso se propaga hasta la raíz. El beneficio es doble: es evidente ante manipulaciones (cualquier cambio se ve en la raíz) y da pruebas de pertenencia baratas. Para probar que un fragmento está en el conjunto no necesitás el conjunto entero, solo el hash hermano de cada nivel en el camino desde tu hoja hasta la raíz (una "prueba de Merkle"), que son apenas unos log₂(n) hashes para n hojas. Cualquiera que tenga la raíz confiable puede recalcularla a partir de tu fragmento más esos hermanos y confirmar que coincide. Así es exactamente como un cliente liviano de Bitcoin o Ethereum verifica que una transacción está en un bloque sin descargar el bloque completo, y la misma idea sostiene a Git, IPFS y Certificate Transparency. (Un detalle que vale la pena saber: cuando un nivel tiene una cantidad impar de nodos, la mayoría de las implementaciones — Bitcoin incluido — simplemente duplican el último hash para poder emparejarlo.)',
						snippet: `import { createHash } from 'node:crypto';
const sha = (s) => createHash('sha256').update(s).digest('hex');

// 1. hasheá cada fragmento de datos → estas son las hojas
let nivel = ['a', 'b', 'c', 'd'].map(sha);

// 2. hasheá pares de hijos en un padre, repetí hasta arriba
while (nivel.length > 1) {
  const siguiente = [];
  for (let i = 0; i < nivel.length; i += 2) {
    const izq = nivel[i];
    const der = nivel[i + 1] ?? izq; // ¿sobra uno? emparejalo consigo mismo
    siguiente.push(sha(izq + der));
  }
  nivel = siguiente;
}

const raiz = nivel[0]; // cambiá CUALQUIER hoja y esta raíz cambia`,
						topic: 'Web3',
						tags: ['Árbol de Merkle', 'Hashing', 'Blockchain', 'Estructuras de datos'],
					},
				],
			},
		],
	},
};
