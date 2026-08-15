// Printing.
//
// The whole PDF pipeline is the browser's own print engine: real embedded
// fonts, selectable text, live links, and zero bytes of dependency. The only
// engineering is isolation — the sheet is cloned into its own document inside a
// hidden iframe, so nothing from the editor UI can reach the paper and there is
// no `@media print` fight with the surrounding page.

import { printCss } from './sheet-css';

/** Filename the browser proposes in the Save-as-PDF dialog. */
export function suggestFilename(name: string, role: string): string {
	const slug = (s: string) =>
		s
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^A-Za-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	const parts = [slug(name), slug(role.split(/[·|,/]/)[0] ?? '')].filter(Boolean);
	return parts.join('-') || 'CV';
}

export type PrintOptions = {
	sheetHtml: string;
	css: string;
	page: string;
	/** Becomes the iframe document's title, which is what the dialog offers as
	 *  the filename. */
	title: string;
};

export function printSheet({ sheetHtml, css, page, title }: PrintOptions): void {
	const old = document.getElementById('cv-print-frame');
	if (old) old.remove();

	const frame = document.createElement('iframe');
	frame.id = 'cv-print-frame';
	frame.setAttribute('aria-hidden', 'true');
	frame.setAttribute('tabindex', '-1');
	// Off-screen rather than display:none — a hidden iframe doesn't lay out, and
	// a frame with no layout prints blank.
	frame.style.cssText = 'position:fixed;right:0;bottom:0;width:1px;height:1px;opacity:0;border:0;pointer-events:none;';

	const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	frame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${css}
${printCss(page)}</style></head><body>${sheetHtml}</body></html>`;

	let done = false;
	const cleanup = () => {
		if (done) return;
		done = true;
		window.setTimeout(() => frame.remove(), 500);
	};

	frame.addEventListener('load', () => {
		const win = frame.contentWindow;
		if (!win) {
			cleanup();
			return;
		}
		win.addEventListener('afterprint', cleanup);
		// Give the iframe a frame to lay out and resolve fonts before printing.
		win.requestAnimationFrame(() => {
			win.requestAnimationFrame(() => {
				try {
					win.focus();
					win.print();
				} catch {
					cleanup();
				}
				// Safari never fires afterprint from an iframe; fall back to a timer.
				window.setTimeout(cleanup, 60_000);
			});
		});
	});

	document.body.appendChild(frame);
}
