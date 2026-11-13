# 99arrzel.github.io

My personal site. Home to a wall of sad memes, a live countdown to the end of the year, and a list of side projects I mostly never finished.

Live at [99arrzel.github.io](https://99arrzel.github.io). The rest of the trash lives on [my GitHub](https://github.com/99Arrzel).

## What's here

- **Home** — full-screen masonry of LATAM-coded sad/time-running-out memes (Chavo, Don Ramón, Pablo Escobar esperando, Sad Spider-Man, Squidward at the window, the usual suspects) with a glassy countdown floating on top. _Memento mori. Build the thing._ Below it, my life in weeks: one square per week, jobs, degrees and goals drawn on (`src/life.ts`).
- **Projects** — the graveyard, plus CV Press. A brief per project: what it is, how it works, what it's built with (`src/i18n/projects.ts`); screenshots go in `src/assets/projects/`.
- **CV** (`/cv`) — CV Press, a CV builder that runs entirely in the browser. It opens on my own CV (`src/scripts/cv/default-cv.ts`), which is also where the About page gets my jobs and degrees from.
- **Vault** — the writing: markdown in `src/content/vault/`, grouped by topic (`src/vault.ts`), and in the RSS feed.
- **Interviews** — questions I fumbled, with the answers I should have given.
- **About** — who I am, what I do, where I've worked, where I went to school.

Everything except the posts exists in English and Spanish (`/es/`); the copy lives in `src/i18n/`.

Projects, Vault, Interviews and About share one layout, in the manner of API docs: a menu on the left, what you picked on the right (`src/components/Docs.astro`, `src/styles/docs.css`).

## Stack

- [Astro](https://astro.build) 6
- Plain CSS, no framework
- GitHub Pages for hosting

## Running locally

```sh
bun install     # or npm install
bun run dev     # localhost:4321
bun run build   # static build to ./dist/
```

## Credit

Theme started as the [Astro Blog starter](https://github.com/withastro/astro/tree/main/examples/blog) (based on [Bear Blog](https://github.com/HermanMartinus/bearblog/)). Most of what you see now was built with Claude Code.
