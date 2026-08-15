// What a parser sees.
//
// First attempt at this walked the DOM in source order, on the theory that a
// browser paints in DOM order and PDF extraction follows the content stream.
// Printing the Rail template and running the result through pdftotext proved
// that wrong: Chrome emits side-by-side columns interleaved by vertical
// position, so the sidebar and the main column come back braided together —
// the exact failure this panel exists to expose, and the one a DOM walk hides.
//
// So it linearises geometrically instead: collect the text-bearing blocks, band
// them into rows by vertical position, and read each row left to right. For a
// single-column CV that is identical to source order; for anything with columns
// it reproduces the braiding.
//
// This models *reading order*, which is where layouts actually go wrong. It
// can't model glyph-level damage — letter-spacing wide enough to make an
// extractor insert spaces between characters looks fine here and broken in the
// PDF — so the sheet stylesheet keeps tracking below the threshold measured to
// be safe rather than relying on this to catch it.

/** Tags that establish a new block; anything else is treated as inline. */
const BLOCK = new Set([
	'ARTICLE', 'SECTION', 'HEADER', 'FOOTER', 'DIV', 'P',
	'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
	'UL', 'OL', 'LI', 'DL', 'DT', 'DD',
]);

/** Vertical slack, in unscaled layout px, for treating blocks as one row. */
const ROW_TOLERANCE = 8;

type Block = { top: number; left: number; text: string };

export function extractText(root: Element): string {
	const rootRect = root.getBoundingClientRect();
	const rootWidth = (root as HTMLElement).offsetWidth || rootRect.width || 1;
	// The preview is displayed through a scale() transform, so client rects are
	// scaled while layout is not. Normalise back to layout px.
	const scale = rootRect.width / rootWidth || 1;

	const blocks: Block[] = [];

	const collect = (el: Element): void => {
		const children = Array.from(el.children);
		const hasBlockChild = children.some((c) => BLOCK.has(c.tagName));
		if (!hasBlockChild) {
			const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
			if (!text) return;
			const r = el.getBoundingClientRect();
			blocks.push({
				top: (r.top - rootRect.top) / scale,
				left: (r.left - rootRect.left) / scale,
				text: el.tagName === 'LI' ? `· ${text}` : text,
			});
			return;
		}
		for (const child of children) collect(child);
	};
	collect(root);

	blocks.sort((a, b) => a.top - b.top || a.left - b.left);

	// Band into rows, then read each row left to right.
	const rows: Block[][] = [];
	for (const b of blocks) {
		const row = rows[rows.length - 1];
		if (row && b.top - row[0].top < ROW_TOLERANCE) row.push(b);
		else rows.push([b]);
	}

	return rows
		.map((row) => row.slice().sort((a, b) => a.left - b.left).map((b) => b.text).join(' '))
		.join('\n')
		.replace(/[ \t]+/g, ' ')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

/** Rough word count of the visible résumé text — used by the linter and the UI. */
export function wordCount(text: string): number {
	const words = text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu);
	return words ? words.length : 0;
}

/** Share of the sheet's height a box must cover to count as a column. */
const COLUMN_MIN_HEIGHT = 0.12;

/**
 * Does this layout put two independent content streams side by side? That is
 * what braids the extracted text.
 *
 * Detected structurally rather than by scanning for horizontal jumps in the
 * output: a right-aligned date sitting beside a job title is also a big
 * horizontal jump, and flagging that would fire on every single-column CV. Real
 * columns are two boxes that occupy disjoint horizontal ranges while running
 * down the page alongside each other.
 */
export function hasColumns(root: Element): boolean {
	const rootHeight = (root as HTMLElement).offsetHeight || 1;
	const minHeight = rootHeight * COLUMN_MIN_HEIGHT;

	const check = (el: Element): boolean => {
		const kids = Array.from(el.children).map((k) => ({ el: k, r: k.getBoundingClientRect() }));
		const tall = kids.filter((k) => k.r.height > 0);
		for (let i = 0; i < tall.length; i++) {
			for (let j = i + 1; j < tall.length; j++) {
				const a = tall[i].r;
				const b = tall[j].r;
				// Both must be substantial; a one-line date is not a column.
				if (a.height < minHeight || b.height < minHeight) continue;
				const xDisjoint = a.right <= b.left + 1 || b.right <= a.left + 1;
				if (!xDisjoint) continue;
				const yOverlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
				if (yOverlap > Math.min(a.height, b.height) * 0.5) return true;
			}
		}
		return tall.some((k) => k.r.height >= minHeight && check(k.el));
	};

	return check(root);
}
