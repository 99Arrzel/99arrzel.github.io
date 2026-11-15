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
| Server | One HostHatch NVMe VPS | Lowest price per GB of RAM I've found, AMD EPYC + NVMe |
| Static site / docs / landing | Astro + Markdown | Content is files; nothing to run |
| Web app | Next.js (React) | Most popular, easiest React setup, agents know it best |
| API | oRPC | End-to-end types, and the same routes can be exposed as OpenAPI later |
| Backend code | Plain functions: routes → services → repositories | No classes, no DI container; easy to read, easy to test |
| Database | Postgres | Relational covers ~99% of what I build |
| Real-time | Server-Sent Events through oRPC; WebSockets only when it's truly two-way | See below |
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

- **NVMe 8 GB is enough to start**: Next.js, Postgres and a small worker fit in 8 GB. NVMe 16 GB is the "~16 a month" box, and its two dedicated cores matter for Postgres once there's real load.
- **Why not Hetzner:** it's cheap, just not this cheap. After its June 2026 price rise, 8 GB is €8.49 and 16 GB is €15.99, both plus €0.50 for IPv4 and VAT, against $9 and $15 here — and HostHatch's 16 GB plan includes dedicated cores.
- **Disk is the tight resource**, not RAM. 35 GB holds the OS, Docker images and Postgres for a while; prune old images on every deploy and watch `df`.
- **Transfer counts both directions** and the server is throttled to 5 Mbps once the monthly quota runs out. Nightly off-box backups count against it too.
- **Billing is strict**: per the terms, an unpaid invoice can mean suspension after 2 days and deletion after 5. Auto-pay with a card that won't expire, and keep backups outside the account.
- Cores are mostly "fair-share" (shared with neighbours). Fine for a web app; it's the reason to move up to a plan with dedicated cores before Postgres becomes the bottleneck.

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

## Real-time: SSE first

Most "real-time" features are the server telling the browser something happened: notifications, a job finished, a counter changed. That's one-directional, so I use **Server-Sent Events** through an oRPC streaming procedure (`eventIterator`). It reuses the normal session auth and middleware for free, and it runs inside the Next.js server — no second service. PostReminder made exactly this call for its notification bell.

The pattern that makes it reliable:

1. Write the event to Postgres first. Postgres is the record.
2. Then publish it to a pub/sub channel. Pub/sub is transport only; a lost message is fine.
3. On reconnect, the client sends the last id it saw and the server replays the gap from Postgres.

For the pub/sub on a single box, Postgres `LISTEN/NOTIFY` is enough — one less service. Add Valkey (Redis) when it isn't: more than one app process, or heavier fan-out.

A separate **WebSocket service** is only for genuinely two-way, high-frequency traffic: chat with typing indicators, collaborative editing, multiplayer. Next.js's standalone server can't accept WebSocket upgrades, so that service is its own container on the same box.

## Standing it up

### 1. Provision

1. Create the VM in the HostHatch panel with Ubuntu LTS and my SSH key, in the location closest to my users. No password login.
2. Attach a **HostHatch firewall group** allowing only 22, 80 and 443. Use the provider firewall, not just `ufw`: ports published by Docker bypass `ufw` rules.
3. On the box: create a non-root user with sudo, set `PasswordAuthentication no` in sshd, enable `unattended-upgrades`, install Docker.
4. Point DNS (`app.example.com`, `example.com`) at the server's IP.

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
    depends_on: [db]
  db:
    image: postgres:18
    env_file: .env
    volumes:
      - pg_data:/var/lib/postgresql
volumes:
  caddy_data:
  pg_data:
```

```
app.example.com {
	reverse_proxy app:3000
}
```

`db` has no `ports:` entry on purpose. `.env` lives on the server only and never goes into git.

### 3. Deploy

GitHub Actions on push to `main`: build the Docker image, push it to GHCR, SSH into the box, run migrations, then `docker compose pull app && docker compose up -d app`. Migrations run first, which is why they have to be additive.

### 4. Backups — the part that actually matters

The cheap single box is only acceptable because of this step.

- Nightly `pg_dump -Fc` from a cron on the host, copied **off HostHatch** (any S3-compatible bucket at a different provider). Keep at least 7 dailies and 4 weeklies.
- HostHatch snapshots are a bonus, not the plan: before a risky change they're great, but they live in the same account as the thing they protect — and that account can be wiped over an unpaid invoice.
- **Restore once before launch**: new server, fresh Postgres, `pg_restore`, app boots against it. Write down how long it took. A backup I have never restored is a guess.

### 5. Know when it's down

An external uptime check on a `/health` route that also queries the database, alerting to my phone. Logs via `docker compose logs`; error tracking (Sentry or a self-hosted GlitchTip) once real users show up.

## Still to decide

The list I want answered before the first real project starts on this:

- **ORM:** Prisma (what I know from PostReminder) or Drizzle (closer to SQL, lighter in Docker). The repository layer hides the choice from services either way.
- **Auth:** copy PostReminder's opaque session id cookie + `sessions` table + Google OAuth, or use a library.
- **Email:** a transactional provider for sign-up, password reset and receipts.
- **Payments:** Stripe, with the webhook handler as an ordinary route → service.
- **File uploads:** an S3-compatible bucket; never the VPS disk.
- **Background jobs:** a Postgres-backed queue (pg-boss style) in a worker container, so there's still no extra datastore.
- **Edge:** whether to put Cloudflare in front for DNS, caching and DDoS cover.
- **Legal:** privacy policy and terms before the first paying user.
