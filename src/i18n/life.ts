// Copy for the Life in Weeks section of the home page.
//
// Strings with `{n}` / `{age}` placeholders are filled in by the page script at
// runtime, because every number on the page depends on today's date. The
// milestones themselves live in `src/life.ts`.

import type { Lang } from './index';

type LifeCopy = {
	title: string;
	introHtml: string;
	// The status line above the grid.
	age: string;
	birthdayToday: string;
	birthdayTomorrow: string;
	birthdayIn: string;
	stats: {
		lived: string;
		left: string;
		percent: string;
	};
	legend: {
		lived: string;
		now: string;
		left: string;
		milestone: string;
		goal: string;
		holidays: string;
		working: string;
		studying: string;
		overlap: string;
	};
	present: string;
	holidays: { xmas: string; ny: string };
	// Shown under a holiday in the panel.
	holidayNote: string;
	// Label for a milestone only known to the year.
	sometimeIn: string;
	xmasLeft: string;
	// Heading of the detail panel for a square with no milestone on it.
	cell: string;
	goalTag: string;
	panelHint: string;
	milestonesTitle: string;
	gridAria: string;
};

export const life: Record<Lang, LifeCopy> = {
	en: {
		title: 'Life in weeks',
		introHtml: `Each square is one week of my life, and each row is one year, out of a round guess of 80. The idea
			comes from Tim Urban's
			<a href="https://waitbutwhy.com/2014/05/life-weeks.html" target="_blank" rel="noopener">Your Life in Weeks</a>.
			The weeks that mattered are marked on it.`,
		age: "I'm {age}.",
		birthdayToday: 'Happy birthday.',
		birthdayTomorrow: 'Birthday tomorrow.',
		birthdayIn: 'Next birthday in {n} days.',
		stats: {
			lived: 'Weeks lived',
			left: 'Weeks left',
			percent: 'used up',
		},
		legend: {
			lived: 'Lived',
			now: 'Now',
			left: 'Left',
			milestone: 'Milestone',
			goal: 'Goal',
			holidays: 'Christmas & New Year',
			working: 'Working',
			studying: 'Studying',
			overlap: 'At the same time',
		},
		present: 'present',
		holidays: { xmas: 'Christmas', ny: 'New Year' },
		holidayNote: 'The whole family together.',
		sometimeIn: 'Sometime in {y}',
		xmasLeft: '{n} Christmases left, if I make it to {age}. Fewer with the people older than me.',
		cell: 'Age {age}, week {n}',
		goalTag: 'Goal',
		panelHint: 'Click any square, or focus the grid and use the arrow keys.',
		milestonesTitle: 'Milestones',
		gridAria: 'Life grid. Arrow keys move between squares; Home jumps to now.',
	},
	es: {
		title: 'La vida en semanas',
		introHtml: `Cada cuadradito es una semana de mi vida, y cada fila es un año, sobre un número redondo de 80. La
			idea viene de
			<a href="https://waitbutwhy.com/2014/05/life-weeks.html" target="_blank" rel="noopener">Your Life in Weeks</a>,
			de Tim Urban. Las semanas que importaron están marcadas.`,
		age: 'Tengo {age}.',
		birthdayToday: 'Feliz cumpleaños.',
		birthdayTomorrow: 'Mañana es el cumpleaños.',
		birthdayIn: 'Próximo cumpleaños en {n} días.',
		stats: {
			lived: 'Semanas vividas',
			left: 'Semanas restantes',
			percent: 'consumido',
		},
		legend: {
			lived: 'Vivido',
			now: 'Ahora',
			left: 'Queda',
			milestone: 'Hito',
			goal: 'Meta',
			holidays: 'Navidad y Año Nuevo',
			working: 'Trabajando',
			studying: 'Estudiando',
			overlap: 'A la vez',
		},
		present: 'actualidad',
		holidays: { xmas: 'Navidad', ny: 'Año Nuevo' },
		holidayNote: 'Toda la familia junta.',
		sometimeIn: 'En algún momento de {y}',
		xmasLeft: 'Me quedan {n} Navidades, si llego a los {age}. Menos con la gente mayor que yo.',
		cell: '{age} años, semana {n}',
		goalTag: 'Meta',
		panelHint: 'Tocá cualquier cuadradito, o enfocá la grilla y usá las flechas.',
		milestonesTitle: 'Hitos',
		gridAria: 'Grilla de la vida. Las flechas mueven entre cuadraditos; Inicio vuelve a hoy.',
	},
};
