// Page breaks for a sheet laid out as one continuous column.
//
// The sheet's padding is on the box, so CSS lays it down once at the very top
// and once at the very bottom of the whole document — never at an internal page
// break. Left alone, text runs into the physical edge of page one and starts
// hard against the edge of page two. These helpers reserve a blank band across
// each break (and any other region, like a QR stamp's corner) by inserting
// spacers, so every printed page gets the same margin as the first. Shared by
// the CV Press preview and the static /resume page.

export type Band = { top: number; bottom: number };

function topWithin(el: HTMLElement, root: HTMLElement): number {
	let y = 0;
	let node: HTMLElement | null = el;
	while (node && node !== root) {
		y += node.offsetTop;
		node = node.offsetParent as HTMLElement | null;
	}
	return y;
}

/**
 * Push content out of the given bands.
 *
 * There is no CSS that reserves a per-page region in a continuous flow, so the
 * space is taken by inserting spacers ahead of the first block that would
 * collide, which moves that block past the band.
 */
function reserveBands(sheet: HTMLElement, bands: Band[]): void {
	const body = sheet.querySelector<HTMLElement>('.cv-body') ?? sheet;
	for (let pass = 0; pass < 12; pass++) {
		const blocks = Array.from(
			body.querySelectorAll<HTMLElement>('.cv-entry, .cv-bullets > li, .cv-items > li, .cv-skill, .cv-text, .cv-sec > h2'),
		);
		let moved = false;
		for (const band of bands) {
			for (const b of blocks) {
				if (b.dataset.kept === '1') continue;
				const top = topWithin(b, sheet);
				const bottom = top + b.offsetHeight;
				if (bottom <= band.top || top >= band.bottom) continue;
				const spacer = document.createElement('div');
				spacer.className = 'cv-keepout';
				spacer.style.height = `${Math.ceil(band.bottom - top)}px`;
				b.parentElement?.insertBefore(spacer, b);
				b.dataset.kept = '1';
				moved = true;
				break;
			}
			if (moved) break;
		}
		if (!moved) break;
	}
}

/**
 * Reserve a margin band across every internal page break, plus whatever
 * `extraBands` asks for at a given page count. Reserving space can push content
 * onto another page, which moves every band — so this re-measures until the
 * page count settles. Leaves the sheet padded to a whole number of pages, so
 * "bottom of the sheet" and "bottom of the last page" are the same line.
 *
 * Returns the page count and the height the content actually uses (the padded
 * sheet would otherwise make every document read as full).
 */
export function settlePages(
	sheet: HTMLElement,
	pageH: number,
	extraBands: (pages: number) => Band[] = () => [],
): { pages: number; usedH: number } {
	// Natural content height first — the CSS min-height would mask it.
	sheet.style.minHeight = '0px';
	let pages = Math.max(1, Math.ceil((sheet.offsetHeight - 4) / pageH));
	// The rail template pads its columns, not the sheet; fall back to 15mm.
	const edge = Number.parseFloat(getComputedStyle(sheet).paddingBottom) || (15 * 96) / 25.4;
	let usedH = sheet.offsetHeight;

	for (let attempt = 0; attempt < 6; attempt++) {
		for (const old of Array.from(sheet.querySelectorAll('.cv-keepout'))) old.remove();
		for (const kept of Array.from(sheet.querySelectorAll<HTMLElement>('[data-kept]'))) delete kept.dataset.kept;

		const bands: Band[] = [];
		for (let i = 1; i < pages; i++) bands.push({ top: i * pageH - edge, bottom: i * pageH + edge });
		bands.push(...extraBands(pages));

		sheet.style.minHeight = '0px';
		reserveBands(sheet, bands);
		usedH = sheet.offsetHeight;
		const grown = Math.max(1, Math.ceil((usedH - 4) / pageH));
		if (grown === pages) break;
		pages = grown;
	}
	sheet.style.minHeight = `${pages * pageH - 0.5}px`;
	return { pages, usedH };
}
