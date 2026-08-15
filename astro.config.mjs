// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://99arrzel.github.io',
	// English stays unprefixed so existing links keep working; Spanish lives
	// under /es/. Routes are authored by hand (thin wrappers around a shared
	// page component) — this block is what makes the sitemap emit hreflang
	// alternates for the pairs.
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'es'],
		routing: { prefixDefaultLocale: false },
	},
	integrations: [mdx(), sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es' } } })],
	vite: {
		// brotli-wasm ships a wasm-pack bundle that resolves its binary relative to
		// import.meta.url. Pre-bundling rewrites that and breaks initialisation, so
		// the package is left unoptimised and driven directly (see cv/codec.ts).
		optimizeDeps: { exclude: ['brotli-wasm'] },
	},
});
