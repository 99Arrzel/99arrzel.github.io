---
title: 'My default SaaS stack (a runbook)'
description: 'One cheap VPS, Astro or Next.js, oRPC over plain service and repository functions, Postgres for almost everything. What I pick, why, and the steps to stand it up.'
pubDate: 'Nov 15 2026'
topic: 'building'
---

This is the stack I reach for when I want to ship a small SaaS without thinking about the stack. It's the same shape as PostReminder, minus the parts a one-person product doesn't need. Most of it an agent can scaffold in one go, and when I code by hand I start from here too.

It's a starting point. Every choice is the boring one on purpose.

## The stack at a glance

| Layer | Pick | Why |
|---|---|---|
| Server | One HostHatch NVMe 16 GB VPS, $15/month | Lowest price per GB of RAM I've found, AMD EPYC + NVMe |
| Static site / docs / landing | Astro + Markdown | Content is files; nothing to run |
| Web app | Next.js (React) | Most popular, easiest React setup, agents know it best |
| API | oRPC | End-to-end types, and the same routes can be exposed as OpenAPI later |
| Backend code | Plain functions: routes → services → repositories | No classes, no DI container; easy to read, easy to test |
| Database | Postgres | Relational covers ~99% of what I build |
| Real-time | Server-Sent Events through oRPC, fanned out with Postgres `LISTEN/NOTIFY` | Server → browser is all I need; no extra service |
| File storage | Garage (S3-compatible) on the same box; the browser uploads straight to it with a presigned POST | Same as PostReminder; file bytes never pass through the app |
| Reverse proxy + TLS | Caddy | Automatic HTTPS, two-line config |
| Runtime | Docker Compose on the VPS | One file describes the whole box |

## The server: one cheap VPS

I take the cheapest VPS that fits and put everything on it. For a product with no users yet, that's correct, not reckless — I just have to be honest about what I'm accepting: one box means one point of failure. If it dies, the product is down until I restore it. That's fine **only** if the restore is rehearsed (see backups).

HostHatch compute VMs as advertised in November 2026 (USD, monthly billing):

| Plan | Cores | RAM | NVMe | Transfer | $/month |
|---|---|---|---|---|---|
| NVMe 2 GB | 1 shared | 2 GB | 10 GB | 1 TB | 4 |
| NVMe 4 GB | 2 shared | 4 GB | 20 GB | 1 TB | 6 |
| NVMe 8 GB | 2 shared | 8 GB | 35 GB | 2 TB | 9 |
| NVMe 12 GB | 1 dedicated + 3 shared | 12 GB | 50 GB | 3 TB | 12 |
| NVMe 16 GB | 2 dedicated + 2 shared | 16 GB | 75 GB | 4 TB | 15 |

- **The pick: NVMe 16 GB at $15/month.** Next.js, Postgres, Garage and a worker fit with room to spare, and its two dedicated cores keep Postgres steady. Cheap enough that there's no reason to start smaller; the 8 GB plan at $9 is only for a throwaway prototype.
- **Why not Hetzner:** it's cheap, just not this cheap. After its June 2026 price rise, 8 GB is €8.49 and 16 GB is €15.99, both plus €0.50 for IPv4 and VAT, against $9 and $15 here — and HostHatch's 16 GB plan includes dedicated cores.
- **Disk will run out before RAM**, and I accept that. 75 GB holds the OS, Docker images, Postgres and Garage's files for a long while; prune old images on every deploy and watch `df`. When uploads outgrow it, Garage moves to a HostHatch storage VM in the same location (advertised from $5/month for 1 TB) over the private network, and nothing else changes.
- **Transfer counts both directions** and the server is throttled to 5 Mbps once the monthly quota runs out. Nightly off-box backups count against it too.
- **Billing is strict**: per the terms, an unpaid invoice can mean suspension after 2 days and deletion after 5. Auto-pay with a card that won't expire, and keep backups outside the account.
- The other two cores are "fair-share" (shared with neighbours). Fine for a web app; if Postgres ever becomes CPU-bound, the next plans up add more dedicated cores.

## Frontend: Astro or Next.js

The rule is one question: **does the page need a logged-in user or live data?**

- **No** → Astro. Landing page, docs, blog, changelog. Markdown files in a repo, deployed as static HTML. This site works that way.
- **Yes** → Next.js. The app itself, the admin panel. React, App Router, and the `output: "standalone"` build so it ships as one small Docker image.

## Backend: routes, services, repositories

Same layering as PostReminder, kept small. Three kinds of function, one direction of calls:

| Layer | Owns | Must not |
|---|---|---|
| Route (oRPC procedure) | Input validation (Zod), auth middleware, response shape | Talk to the database, hold business logic |
| Service | Business rules, transaction boundaries | Write queries |
| Repository | Queries, nothing else | Make business decisions |

Every service takes a context (who is calling, which tenant, the db client) as its first argument. Every repository takes the database executor — the client or the open transaction — as its first argument, always explicitly, so a transaction can't be dropped by accident.

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

// repository (Drizzle syntax here; the ORM is still open, see the end)
export function insert(db: DbOrTx, row: NewProject) {
  return db.insert(projects).values(row).returning();
}
```

Crons and background jobs call the **same services** with a system context. They never go through HTTP.

## Database: Postgres, almost always

I don't need a document database. What I build is relational — users, workspaces, subscriptions, things that belong to other things — and Postgres models that directly. When part of the data really is a loose document (settings, third-party webhook payloads), a `jsonb` column holds it and can still be indexed and queried. Mongo has its own market; nothing I plan to build is in it.

Defaults I carry over from PostReminder:

- **UUID v7** primary keys. Never expose a sequential id in a URL or an API.
- **Additive migrations only.** Dropping or renaming a column is a two-step deploy, because migrations run before the new code is live.
- **Soft delete** (`deleted_at`) on domain tables.
- Postgres listens on the private Docker network only. It is never published to the internet.

## Real-time: SSE, with Postgres doing the fan-out

Most "real-time" features are the server telling the browser something happened: notifications, a job finished, a counter changed. That's one-directional, so I use **Server-Sent Events** through an oRPC streaming procedure (`eventIterator`). It reuses the normal session auth and middleware for free, and it runs inside the Next.js server — no second service.

PostReminder made the same call, for two reasons. WebSockets there would have meant spinning up another service on AWS, and I'm not the AWS admin, so that was off the table. And nothing in the product pushes from the user to the server — updates only flow server → user. SSE was simply the option that ships. On my own VPS I *could* run a WebSocket service, but the second reason still holds, so the answer doesn't change.

The pattern that makes it reliable:

1. Write the event to Postgres first. Postgres is the record.
2. Then publish it to a pub/sub channel. Pub/sub is transport only; a lost message is fine.
3. On reconnect, the client sends the last id it saw and the server replays the gap from Postgres.

For the pub/sub I use **Postgres `LISTEN/NOTIFY`** instead of Valkey or Redis. It's already running, and it has one property Valkey can't give me: a `NOTIFY` sent inside a transaction is only delivered **if that transaction commits**. Steps 1 and 2 become one atomic write, so a listener can never hear about a row that got rolled back.

```sql
-- write path, inside the same transaction as the INSERT
SELECT pg_notify('events', '<event id>');

-- each app process keeps one dedicated connection open that ran:
LISTEN events;
```

Rules that keep it out of trouble:

- **Send ids, not data.** The payload limit is 8000 bytes; the listener loads the row from Postgres anyway.
- **One listening connection per process**, held directly — not through a pooler in transaction mode, which drops `LISTEN`.
- **Switch to Valkey** only when this stops fitting: many app processes, or a lot of messages per second.

A separate **WebSocket service** stays reserved for genuinely two-way, high-frequency traffic: chat with typing indicators, collaborative editing, multiplayer. Next.js's standalone server can't accept WebSocket upgrades, so that would be its own container on the same box.

## File storage: Garage and presigned uploads

Files live in **Garage**, the same S3-compatible store PostReminder runs, as one more container on the box. The one rule: **file bytes never go through my backend.** The app only signs a short-lived upload permission; the browser sends the file straight to Garage.

<figure class="seq-diagram">
<svg viewBox="0 0 900 470" role="img" aria-labelledby="upload-flow-title" xmlns="http://www.w3.org/2000/svg">
<title id="upload-flow-title">Presigned upload: the browser asks the app for a signed policy, posts the file directly to Garage, then registers the key with the app, which checks it in Garage and records it in Postgres.</title>
<style>
.seq-diagram { overflow-x: auto; }
.seq-diagram svg { width: 100%; min-width: 640px; height: auto; display: block; }
.seq-diagram .box { fill: var(--bg-secondary); stroke: var(--border); }
.seq-diagram .name { fill: var(--text-heading); font: 600 15px var(--mono); text-anchor: middle; }
.seq-diagram .sub { fill: var(--text-light); font: 12px var(--mono); text-anchor: middle; }
.seq-diagram .life { stroke: var(--border); stroke-dasharray: 4 5; }
.seq-diagram .msg { stroke: var(--text-light); stroke-width: 1.5; fill: none; }
.seq-diagram .ret { stroke-dasharray: 6 5; }
.seq-diagram .hot { stroke: var(--accent); stroke-width: 3; }
.seq-diagram .tip { fill: var(--text-light); }
.seq-diagram .tip-hot { fill: var(--accent); }
.seq-diagram .label { fill: var(--text); font: 13px var(--mono); text-anchor: middle; paint-order: stroke; stroke: var(--bg); stroke-width: 6px; stroke-linejoin: round; }
.seq-diagram .label-hot { fill: var(--accent); font-weight: 600; }
.seq-diagram figcaption { color: var(--text-light); font-size: 0.9em; margin-top: 0.5em; }
</style>
<defs>
<marker id="seq-tip" viewBox="0 0 10 10" refX="10" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto-start-reverse"><path class="tip" d="M0,0 L10,5 L0,10 z"/></marker>
<marker id="seq-tip-hot" viewBox="0 0 10 10" refX="10" refY="5" markerUnits="userSpaceOnUse" markerWidth="13" markerHeight="13" orient="auto-start-reverse"><path class="tip-hot" d="M0,0 L10,5 L0,10 z"/></marker>
</defs>
<rect class="box" x="10" y="12" width="160" height="56" rx="8"/>
<text class="name" x="90" y="37">Browser</text>
<text class="sub" x="90" y="56">client</text>
<rect class="box" x="260" y="12" width="160" height="56" rx="8"/>
<text class="name" x="340" y="37">App</text>
<text class="sub" x="340" y="56">Next.js + oRPC</text>
<rect class="box" x="510" y="12" width="160" height="56" rx="8"/>
<text class="name" x="590" y="37">Garage</text>
<text class="sub" x="590" y="56">S3 API</text>
<rect class="box" x="730" y="12" width="160" height="56" rx="8"/>
<text class="name" x="810" y="37">Postgres</text>
<text class="sub" x="810" y="56">record</text>
<line class="life" x1="90" y1="68" x2="90" y2="460"/>
<line class="life" x1="340" y1="68" x2="340" y2="460"/>
<line class="life" x1="590" y1="68" x2="590" y2="460"/>
<line class="life" x1="810" y1="68" x2="810" y2="460"/>
<line class="msg" x1="90" y1="110" x2="340" y2="110" marker-end="url(#seq-tip)"/>
<text class="label" x="215" y="101">1  presign({ name, type })</text>
<line class="msg ret" x1="340" y1="155" x2="90" y2="155" marker-end="url(#seq-tip)"/>
<text class="label" x="215" y="146">2  { url, fields, key }</text>
<line class="msg hot" x1="90" y1="210" x2="590" y2="210" marker-end="url(#seq-tip-hot)"/>
<text class="label label-hot" x="340" y="200">3  POST the file straight to Garage</text>
<line class="msg ret" x1="590" y1="255" x2="90" y2="255" marker-end="url(#seq-tip)"/>
<text class="label" x="340" y="246">4  204 · Garage enforced size + type</text>
<line class="msg" x1="90" y1="310" x2="340" y2="310" marker-end="url(#seq-tip)"/>
<text class="label" x="215" y="301">5  register({ key })</text>
<line class="msg" x1="340" y1="355" x2="590" y2="355" marker-end="url(#seq-tip)"/>
<text class="label" x="465" y="346">6  HEAD key: size, type</text>
<line class="msg" x1="340" y1="400" x2="810" y2="400" marker-end="url(#seq-tip)"/>
<text class="label" x="575" y="391">7  INSERT the file row</text>
<line class="msg ret" x1="340" y1="445" x2="90" y2="445" marker-end="url(#seq-tip)"/>
<text class="label" x="215" y="436">8  { id, url }</text>
</svg>
<figcaption>The only arrow that carries the file (3) skips the app entirely. The app signs, checks and records.</figcaption>
</figure>

Step by step:

1. **Presign.** The browser asks for an upload. The route checks auth, plan limits and the content type, picks the key itself (`<workspace>/<uuid v7>`, never the user's filename), and signs a **presigned POST** policy that expires in minutes.
2. The app returns the Garage URL, the signed form fields, and the key.
3. **Upload.** The browser posts the file as a form directly to Garage.
4. Garage checks the signed policy before accepting a byte: a file over the size limit or with a different content type is rejected there. This is why it's a presigned **POST**, not a presigned PUT — the policy can carry a `content-length-range`.
5. **Register.** The browser tells the app which key it uploaded.
6. The app `HEAD`s the object in Garage to confirm it exists and to read its real size and type — never trust the client's word for it.
7. Only then does the file get a row in Postgres.
8. The app returns the file's id; reads go through a short-lived presigned GET (or a public bucket for truly public assets).

```ts
// route: sign the upload (same shape as PostReminder's presign route)
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

// browser: the file goes last in the form
const form = new FormData();
for (const [k, v] of Object.entries(fields)) form.append(k, v);
form.append('file', file);
await fetch(url, { method: 'POST', body: form });
```

Details that bite:

- The S3 client points at Garage: `endpoint: 'https://files.example.com'`, `region: 'garage'`, `forcePathStyle: true`.
- The bucket needs a **CORS rule** allowing `POST` from the app's origin, or the browser blocks step 3. Garage supports `PutBucketCors`.
- Rate-limit the presign route. A signed policy is a write credential; without a limit, anyone logged in can mint them and fill the disk.
- Uploads that are never registered leave orphan objects. A nightly job deletes objects older than a day that have no row.

## Standing it up

### 1. Provision

1. Create the VM in the HostHatch panel with Ubuntu LTS and my SSH key, in the location closest to my users. No password login.
2. Attach a **HostHatch firewall group** allowing only 22, 80 and 443. Use the provider firewall, not just `ufw`: ports published by Docker bypass `ufw` rules.
3. On the box: create a non-root user with sudo, set `PasswordAuthentication no` in sshd, enable `unattended-upgrades`, install Docker.
4. Point DNS (`app.example.com`, `files.example.com`, `example.com`) at the server's IP.

### 2. One compose file

```yaml
services:
  caddy:
    image: caddy:2
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
  app:
    image: ghcr.io/<me>/<app>:latest
    env_file: .env
    depends_on: [db, garage]
  db:
    image: postgres:18
    env_file: .env
    volumes:
      - pg_data:/var/lib/postgresql
  garage:
    image: dxflrs/garage:v2.2.0
    volumes:
      - ./garage.toml:/etc/garage.toml:ro
      - garage_meta:/var/lib/garage/meta
      - garage_data:/var/lib/garage/data
volumes:
  caddy_data:
  pg_data:
  garage_meta:
  garage_data:
```

```
app.example.com {
	reverse_proxy app:3000
}

files.example.com {
	reverse_proxy garage:3900
}
```

`db` and `garage` have no `ports:` entry on purpose: the outside world reaches Garage only through Caddy, over HTTPS, and only its S3 API. `.env` and `garage.toml` (with real `rpc_secret` and `admin_token`, `replication_factor = 1`) live on the server only and never go into git.

Garage once, after the first `up` (each command via `docker compose exec garage /garage …`):

```sh
garage status                                  # copy the node id
garage layout assign -z dc1 -c 50G <node_id>
garage layout apply --version 1
garage bucket create uploads
garage key create app-key                      # goes into .env
garage bucket allow --read --write uploads --key app-key
```

Then set the bucket's CORS rule (allow `POST` from `https://app.example.com`) with any S3 client, e.g. `aws s3api put-bucket-cors --endpoint-url https://files.example.com`.

### 3. Deploy

GitHub Actions on push to `main`: build the Docker image, push it to GHCR, SSH into the box, run migrations, then `docker compose pull app && docker compose up -d app`. Migrations run first, which is why they have to be additive.

### 4. Backups — the part that actually matters

The cheap single box is only acceptable because of this step.

- Nightly `pg_dump -Fc` from a cron on the host, copied **off HostHatch** (any S3-compatible bucket at a different provider). Keep at least 7 dailies and 4 weeklies.
- Garage's bucket gets the same treatment: a nightly `rclone sync` of `uploads` to the off-site bucket. A database row pointing at a file that no longer exists is still data loss.
- HostHatch snapshots are a bonus, not the plan: before a risky change they're great, but they live in the same account as the thing they protect — and that account can be wiped over an unpaid invoice.
- **Restore once before launch**: new server, fresh Postgres, `pg_restore`, files synced back into Garage, app boots against it. Write down how long it took. A backup I have never restored is a guess.

### 5. Know when it's down

An external uptime check on a `/health` route that also queries the database, alerting to my phone. Logs via `docker compose logs`; error tracking (Sentry or a self-hosted GlitchTip) once real users show up.

## Still to decide

The list I want answered before the first real project starts on this:

- **ORM:** Prisma (what I know from PostReminder) or Drizzle (closer to SQL, lighter in Docker). The repository layer hides the choice from services either way.
- **Auth:** copy PostReminder's opaque session id cookie + `sessions` table + Google OAuth, or use a library.
- **Email:** a transactional provider for sign-up, password reset and receipts.
- **Payments:** Stripe, with the webhook handler as an ordinary route → service.
- **Background jobs:** a Postgres-backed queue (pg-boss style) in a worker container, so there's still no extra datastore.
- **Edge:** whether to put Cloudflare in front for DNS, caching and DDoS cover.
- **Legal:** privacy policy and terms before the first paying user.
