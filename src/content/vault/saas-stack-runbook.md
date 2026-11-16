---
title: 'My default SaaS stack (a runbook)'
description: 'One $15 VPS, Astro or Next.js, oRPC over plain functions, Postgres for almost everything. What I pick and how I stand it up.'
pubDate: 'Nov 15 2026'
topic: 'building'
---

The stack I reach for when I want to ship a small SaaS without thinking about the stack. Every choice is the boring one on purpose, and an agent can scaffold most of it in one go.

## The stack

| Layer | Pick |
|---|---|
| Server | HostHatch NVMe 16 GB, $15/month |
| DNS + edge | Cloudflare |
| Static pages | Astro + Markdown |
| App | Next.js + oRPC |
| Backend code | Plain functions: routes → services → repositories |
| Database | Postgres + Prisma |
| Auth | Session cookie + `sessions` table, password + Google |
| Real-time | Server-Sent Events, fanned out with Postgres `LISTEN/NOTIFY` |
| Files | Garage, uploaded straight from the browser with a presigned POST |
| Payments | Stripe |
| Background jobs | Postgres-backed queue in a worker container |
| Runtime | Docker Compose + Caddy (automatic HTTPS) |

<figure class="dg">
<svg viewBox="0 0 1000 440" role="img" aria-labelledby="box-title" xmlns="http://www.w3.org/2000/svg">
<title id="box-title">Browser to Cloudflare to Caddy on one HostHatch VPS. Caddy routes to the Next.js app and to Garage. The app and the worker use Postgres. Postgres and Garage are backed up nightly to an off-site bucket.</title>
<style>
.dg { margin: 2em 0; overflow-x: auto; }
.dg svg { display: block; width: 100%; min-width: 720px; height: auto; }
.dg .box { fill: var(--bg-secondary); stroke: var(--border); stroke-width: 1.5; }
.dg .vps { fill: none; stroke: var(--accent); stroke-width: 1.5; stroke-dasharray: 8 6; }
.dg .name { fill: var(--text-heading); font: 600 18px var(--mono); text-anchor: middle; }
.dg .sub { fill: var(--text-light); font: 14px var(--mono); text-anchor: middle; }
.dg .tag { fill: var(--accent); font: 600 15px var(--mono); }
.dg .msg { stroke: var(--text-light); stroke-width: 2; fill: none; }
.dg .ret { stroke-dasharray: 7 6; }
.dg .hot { stroke: var(--accent); stroke-width: 3.5; }
.dg .tip { fill: var(--text-light); }
.dg .tip-hot { fill: var(--accent); }
.dg .life { stroke: var(--border); stroke-width: 1.5; stroke-dasharray: 4 6; }
.dg .label { fill: var(--text); font: 16px var(--mono); text-anchor: middle; paint-order: stroke; stroke: var(--bg); stroke-width: 7px; stroke-linejoin: round; }
.dg .label-hot { fill: var(--accent); font-weight: 600; }
.dg figcaption { color: var(--text-light); font-size: 0.85em; margin-top: 0.6em; }
</style>
<defs>
<marker id="dg-tip" viewBox="0 0 10 10" refX="10" refY="5" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" orient="auto-start-reverse"><path class="tip" d="M0,0 L10,5 L0,10 z"/></marker>
<marker id="dg-tip-hot" viewBox="0 0 10 10" refX="10" refY="5" markerUnits="userSpaceOnUse" markerWidth="15" markerHeight="15" orient="auto-start-reverse"><path class="tip-hot" d="M0,0 L10,5 L0,10 z"/></marker>
</defs>
<rect class="vps" x="360" y="14" width="626" height="332" rx="14"/>
<text class="tag" x="380" y="42">HostHatch VPS · 16 GB · $15/mo</text>
<rect class="box" x="14" y="166" width="140" height="68" rx="10"/>
<text class="name" x="84" y="196">Browser</text>
<text class="sub" x="84" y="218">users</text>
<rect class="box" x="190" y="166" width="140" height="68" rx="10"/>
<text class="name" x="260" y="196">Cloudflare</text>
<text class="sub" x="260" y="218">DNS · proxy</text>
<rect class="box" x="384" y="166" width="120" height="68" rx="10"/>
<text class="name" x="444" y="196">Caddy</text>
<text class="sub" x="444" y="218">HTTPS</text>
<rect class="box" x="560" y="70" width="180" height="68" rx="10"/>
<text class="name" x="650" y="100">Next.js app</text>
<text class="sub" x="650" y="122">oRPC · SSE</text>
<rect class="box" x="560" y="262" width="180" height="68" rx="10"/>
<text class="name" x="650" y="292">Garage</text>
<text class="sub" x="650" y="314">files · S3 API</text>
<rect class="box" x="790" y="70" width="180" height="68" rx="10"/>
<text class="name" x="880" y="100">Postgres</text>
<text class="sub" x="880" y="122">data · NOTIFY</text>
<rect class="box" x="790" y="262" width="180" height="68" rx="10"/>
<text class="name" x="880" y="292">Worker</text>
<text class="sub" x="880" y="314">jobs · crons</text>
<rect class="box" x="660" y="370" width="326" height="58" rx="10"/>
<text class="name" x="823" y="395">Off-site bucket</text>
<text class="sub" x="823" y="415">nightly pg_dump + files</text>
<line class="msg hot" x1="154" y1="200" x2="190" y2="200" marker-end="url(#dg-tip-hot)"/>
<line class="msg hot" x1="330" y1="200" x2="384" y2="200" marker-end="url(#dg-tip-hot)"/>
<line class="msg hot" x1="504" y1="186" x2="560" y2="122" marker-end="url(#dg-tip-hot)"/>
<line class="msg hot" x1="504" y1="214" x2="560" y2="278" marker-end="url(#dg-tip-hot)"/>
<line class="msg" x1="740" y1="104" x2="790" y2="104" marker-start="url(#dg-tip)" marker-end="url(#dg-tip)"/>
<line class="msg" x1="880" y1="262" x2="880" y2="138" marker-end="url(#dg-tip)"/>
<line class="msg ret" x1="823" y1="346" x2="823" y2="370" marker-end="url(#dg-tip)"/>
<text class="label" x="508" y="160">app.</text>
<text class="label" x="500" y="272">files.</text>
</svg>
<figcaption>Everything runs on one box. Only the backups leave it.</figcaption>
</figure>

## Server: HostHatch, 16 GB for $15

| Plan | Cores | RAM | NVMe | Transfer | $/month |
|---|---|--:|--:|--:|--:|
| NVMe 8 GB | 2 shared | 8 GB | 35 GB | 2 TB | $9 |
| NVMe 12 GB | 1 dedicated + 3 shared | 12 GB | 50 GB | 3 TB | $12 |
| **NVMe 16 GB** | **2 dedicated + 2 shared** | **16 GB** | **75 GB** | **4 TB** | **$15** |

- Cheaper than Hetzner, whose 16 GB plan is €15.99 plus IPv4 and VAT since its June 2026 price rise, with no dedicated cores.
- **Disk runs out before RAM.** When uploads outgrow 75 GB, Garage moves to a HostHatch storage VM (from $5/month for 1 TB) on the private network.
- **Billing is strict:** an unpaid invoice can mean deletion after 5 days. Auto-pay, and keep backups outside the account.

## Frontend

- No login, no live data → **Astro** and Markdown, shipped as static HTML.
- Everything else → **Next.js**, built with `output: "standalone"` into one Docker image.

## Backend: routes, services, repositories

Routes validate input and check access. Services hold the business rules. Repositories are the only code that touches Prisma, and they always take the database client or the open transaction as their first argument. Crons and jobs call the same services directly, never over HTTP.

```ts
// route
export const createProject = authed
  .input(z.object({ name: z.string().min(1) }))
  .handler(({ context, input }) => projectService.create(context, input));

// service
export async function create(ctx: Ctx, input: { name: string }) {
  if (await projectRepo.countByOwner(ctx.db, ctx.user.id) >= ctx.plan.maxProjects) {
    throw limitReached('projects');
  }
  return projectRepo.insert(ctx.db, { ownerId: ctx.user.id, name: input.name });
}

// repository
export function insert(db: DbOrTx, data: Prisma.ProjectUncheckedCreateInput) {
  return db.project.create({ data });
}
```

## Database: Postgres + Prisma

What I build is relational, so Postgres; the odd loose document goes in a `jsonb` column. Prisma because it's what I know best. Defaults: UUID v7 ids (never a sequential id in a URL), additive-only migrations, `deletedAt` soft delete, and Postgres never exposed to the internet.

## Auth

An opaque session id in an HTTP-only cookie, looked up in a `sessions` table, with password and Google sign-in. Libraries like Better Auth or Auth.js would cover the same ground; I stay with the setup I already know end to end.

## Real-time: SSE + `LISTEN/NOTIFY`

**SSE by default.** It's a long HTTP response from the Next.js app I already run, through an oRPC streaming procedure (`eventIterator`), behind the normal auth. WebSockets need a service or two more (a socket server, usually plus Valkey) and only buy the browser → server direction.

| | SSE | WebSockets |
|---|---|---|
| Direction | Server → browser | Both ways |
| Runs in | The existing Next.js app | Its own container (Next.js standalone can't upgrade a connection) |
| Extra services | None | Socket server, plus Valkey or `LISTEN/NOTIFY` so the app can reach it |
| Auth | The normal session cookie and middleware | Re-checked by hand on the upgrade request |
| Reconnect | Built in; the browser resends the last event id | Written by me, along with heartbeats |
| Pick it for | Notifications, job progress, live dashboards, streaming AI output | Chat with typing indicators, collaborative editing, cursors, multiplayer |

Switch only when the browser has to send a steady stream of messages back; an occasional action is just a normal oRPC call.

How the SSE side stays reliable:

1. Write the event row in Postgres.
2. In the same transaction, `SELECT pg_notify('events', '<event id>')`. Postgres only delivers it **if the transaction commits**, so nobody hears about a rolled-back row.
3. Each app process keeps one connection on `LISTEN events` and pushes the event to its open SSE streams.
4. On reconnect, the browser sends the last id it saw and the server replays the gap from Postgres.

Send ids, not data (payloads cap at 8000 bytes). Keep oRPC's keep-alive pings on (the default): Cloudflare drops connections that sit idle for 100 seconds. Move to Valkey only when there are many app processes.

## Files: Garage + presigned uploads

File bytes never pass through the backend. The app signs a short-lived upload; the browser sends the file straight to Garage.

<figure class="dg">
<svg viewBox="0 0 1000 480" role="img" aria-labelledby="upload-title" xmlns="http://www.w3.org/2000/svg">
<title id="upload-title">The browser asks the app for a presigned POST, sends the file straight to Garage, then registers the key. The app checks the object in Garage and saves a row in Postgres.</title>
<rect class="box" x="25" y="12" width="170" height="64" rx="10"/>
<text class="name" x="110" y="40">Browser</text>
<text class="sub" x="110" y="62">client</text>
<rect class="box" x="315" y="12" width="170" height="64" rx="10"/>
<text class="name" x="400" y="40">App</text>
<text class="sub" x="400" y="62">Next.js + oRPC</text>
<rect class="box" x="605" y="12" width="170" height="64" rx="10"/>
<text class="name" x="690" y="40">Garage</text>
<text class="sub" x="690" y="62">S3 API</text>
<rect class="box" x="815" y="12" width="170" height="64" rx="10"/>
<text class="name" x="900" y="40">Postgres</text>
<text class="sub" x="900" y="62">record</text>
<line class="life" x1="110" y1="76" x2="110" y2="470"/>
<line class="life" x1="400" y1="76" x2="400" y2="470"/>
<line class="life" x1="690" y1="76" x2="690" y2="470"/>
<line class="life" x1="900" y1="76" x2="900" y2="470"/>
<line class="msg" x1="110" y1="120" x2="400" y2="120" marker-end="url(#dg-tip)"/>
<text class="label" x="255" y="109">1 presign({ type })</text>
<line class="msg ret" x1="400" y1="168" x2="110" y2="168" marker-end="url(#dg-tip)"/>
<text class="label" x="255" y="157">2 { url, fields, key }</text>
<line class="msg hot" x1="110" y1="222" x2="690" y2="222" marker-end="url(#dg-tip-hot)"/>
<text class="label label-hot" x="400" y="209">3 POST the file straight to Garage</text>
<line class="msg ret" x1="690" y1="270" x2="110" y2="270" marker-end="url(#dg-tip)"/>
<text class="label" x="400" y="259">4 204 · size + type checked</text>
<line class="msg" x1="110" y1="324" x2="400" y2="324" marker-end="url(#dg-tip)"/>
<text class="label" x="255" y="313">5 register({ key })</text>
<line class="msg" x1="400" y1="372" x2="690" y2="372" marker-end="url(#dg-tip)"/>
<text class="label" x="545" y="361">6 HEAD key</text>
<line class="msg" x1="400" y1="420" x2="900" y2="420" marker-end="url(#dg-tip)"/>
<text class="label" x="650" y="409">7 INSERT file row</text>
<line class="msg ret" x1="400" y1="462" x2="110" y2="462" marker-end="url(#dg-tip)"/>
<text class="label" x="255" y="451">8 { id }</text>
</svg>
<figcaption>Only arrow 3 carries the file, and it skips the app. The app signs, checks and records.</figcaption>
</figure>

- **Presigned POST, not PUT:** the signed policy carries a size range and content type, and Garage rejects a bad file before storing it.
- The app picks the key (`<workspace>/<uuid v7>`), never the user's filename.
- After the upload, the app checks the object with a `HEAD` request for its real size and type before saving the row. Never trust the client.

```ts
const { url, fields } = await createPresignedPost(garage, {
  Bucket: 'uploads',
  Key: `${ctx.workspace.id}/${uuidv7()}`,
  Conditions: [
    ['content-length-range', 1, 10 * 1024 * 1024],
    ['eq', '$Content-Type', input.type],
  ],
  Fields: { 'Content-Type': input.type },
  Expires: 600,
});
```

Gotchas: the S3 client needs `forcePathStyle: true` and `region: 'garage'`; the bucket needs a CORS rule allowing `POST` from the app's origin; rate-limit the presign route; a nightly job deletes uploads that were never registered.

## Payments and jobs

- **Stripe.** The webhook is an ordinary route that calls a service.
- **Jobs** go in a Postgres-backed queue (pg-boss style), run by a worker container that calls the same services. Still no extra datastore.

## Standing it up

**1. Server.** Ubuntu LTS, my SSH key, no password login. A HostHatch firewall group allowing only 22, 80 and 443 — the provider firewall, because ports Docker publishes bypass `ufw`.

**2. DNS.** Add the domain to Cloudflare and point `@`, `app` and `files` at the server's IP with A records. Start them grey (DNS only) so Caddy can get its certificates, then turn the proxy on with SSL mode **Full (strict)**. Cloudflare's free plan caps uploads at 100 MB; if files get bigger, leave `files` grey.

**3. Compose.**

```yaml
services:
  caddy:
    image: caddy:2
    ports: ["80:80", "443:443"]
    volumes: [./Caddyfile:/etc/caddy/Caddyfile:ro, caddy_data:/data]
  app:
    image: ghcr.io/<me>/<app>:latest
    env_file: .env
  worker:
    image: ghcr.io/<me>/<app>:latest
    env_file: .env
    command: ["node", "worker.js"]
  db:
    image: postgres:18
    env_file: .env
    volumes: [pg_data:/var/lib/postgresql]
  garage:
    image: dxflrs/garage:v2.2.0
    volumes: [./garage.toml:/etc/garage.toml:ro, garage_meta:/var/lib/garage/meta, garage_data:/var/lib/garage/data]
volumes: { caddy_data: {}, pg_data: {}, garage_meta: {}, garage_data: {} }
```

```
app.example.com {
	reverse_proxy app:3000
}
files.example.com {
	reverse_proxy garage:3900
}
```

Only Caddy publishes ports. `.env` and `garage.toml` live on the server, never in git. Garage needs a one-time setup (`docker compose exec garage /garage …`): `layout assign` + `layout apply`, `bucket create uploads`, `key create`, `bucket allow`.

**4. Deploy.** GitHub Actions: build the image, push to GHCR, SSH in, run migrations, `docker compose up -d app worker`.

**5. Backups.** Nightly `pg_dump` and an `rclone sync` of the bucket, both to a bucket **outside HostHatch**. Restore once before launch onto a fresh server and time it; a backup I've never restored is a guess.

**6. Monitoring.** An external uptime check on `/health` (which queries the database), alerting my phone.

## Legal: AI drafts, a lawyer reviews

I've never done this part, so the process is: give the AI the facts, let it draft, pay an expert to fix it before the first paying user.

1. **Write down the facts.** What personal data I collect and why, where it lives (the HostHatch location), who else touches it (HostHatch, Cloudflare, Stripe, the email provider), how long I keep it, and how a user deletes their account. Plus where I am and where customers are — that decides which laws apply.
2. **AI drafts** a privacy policy and terms of service from those facts. A cookie banner only if I add non-essential cookies like analytics; a data processing agreement only if businesses put their own customers' data in.
3. **A lawyer reviews** the drafts for my jurisdiction. A one-off paid review of a decent draft costs far less than one written from scratch.
4. The final texts live as Markdown pages on the site, dated, and get updated whenever the facts in step 1 change.

## Still open

- **Email:** which transactional provider for sign-up, password reset and receipts.
