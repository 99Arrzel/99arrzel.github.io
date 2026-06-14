---
title: 'JSON as a database (and when that is actually fine)'
description: 'I shipped an attendance system backed by a single JSON file. People love to dunk on this. They are usually wrong about why.'
pubDate: 'Jun 12 2026'
topic: 'engineering'
---

I built an attendance system called [PMSAC](https://github.com/99Arrzel/PMSAC) — *Poor Man's System Attendance Control*. Employees scan an ID barcode with the camera, it figures out whether that's a check-in or a check-out, and it logs it. No database server. The entire "database" is one file: `public/registro.json`.

People love to dunk on this. They're usually wrong about *why*.

## How it actually worked

The whole trick is two lines at the top of the Express server — read the file once at boot and keep it in memory:

```js
let raw = fs.readFileSync(path.join(__dirname, "public", "registro.json"));
let data = JSON.parse(raw); // lives in memory from here on
```

Every scan mutates that in-memory object and rewrites the whole file:

```js
// figure out entrada vs salida from the person's last mark, then:
usuario.marcas.push({ fecha: dia, hora: tiempo, tipo: fue });
fs.writeFileSync(
  path.join(__dirname, "public", "registro.json"),
  JSON.stringify(data)
);
```

That's it. Reads are instant (it's just an object). Writes are a full re-serialize. For one terminal in one office, it never broke a sweat.

## When it's fine

- **Single writer.** One process touching the file. No concurrent writes racing each other — PMSAC is literally one Node process.
- **Small data.** It fits comfortably in memory and you rewrite the whole thing on save.
- **Low stakes on durability.** A crash mid-write losing the last record is annoying, not catastrophic.

If all three hold, a file is less infrastructure to run, deploy, and back up. That's a real feature, not a hack.

## What I got wrong

Notice that `writeFileSync` writes *straight into the live file*. If the process dies mid-write, `registro.json` is now half-written JSON — and on next boot `JSON.parse` throws and the whole thing won't start. Past me got away with it because the write is tiny and the odds are low. Present me wouldn't.

The fix is one extra step: write to a temp file, then rename. Rename is atomic on the same filesystem, so a reader (or the next boot) never sees a half-written file:

```js
function save(path, data) {
  const tmp = `${path}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, path); // atomic swap
}
```

## When it stops being fine

The moment you have **two writers**, you want a real database. Don't bolt locking onto a JSON file — that's just rebuilding SQLite, badly. Reach for SQLite first; it's still one file, still zero servers, and it actually handles concurrency.

The skill isn't "never use a file." It's knowing exactly which of those three assumptions you're leaning on, and noticing the day one of them stops being true.

*(And yes — I committed `node_modules`, and there's a comment in there that translates to "I should split this into more files, but ugh, can't be bothered." We grow.)*
