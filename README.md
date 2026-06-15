# SolidStart Starter

A production-ready, full-stack **starter template** built on the modern Solid stack — clone it, fill in your secrets, and start shipping instead of wiring up auth, an API layer, and a component library from scratch.

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](./LICENSE)
[![Runtime: Deno 2.8.3](https://img.shields.io/badge/Deno-2.8.3-70ffaf?logo=deno&logoColor=black)](https://deno.com/)
[![SolidStart 2.0 (alpha)](https://img.shields.io/badge/SolidStart-2.0--alpha-2c4f7c?logo=solid&logoColor=white)](https://start.solidjs.com/)

> [!NOTE]
> This is a **template to build on**, not a finished product. The bundled task manager, account center, and admin console exist to exercise the stack end-to-end — keep what you need, delete the rest, and rebrand it as your own (see [Make it yours](#-make-it-yours)).

---

## Table of contents

- [What's inside](#-whats-inside)
- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Quick start](#-quick-start)
- [Environment variables](#-environment-variables)
- [External services](#-external-services)
- [Commands](#-commands)
- [Project structure](#-project-structure)
- [Architecture](#-architecture)
- [Database & migrations](#-database--migrations)
- [Deployment](#-deployment)
- [Make it yours](#-make-it-yours)
- [Gotchas & constraints](#-gotchas--constraints)
- [License](#-license)

---

## 🧱 What's inside

| Layer | Technology |
| --- | --- |
| **Runtime** | [Deno](https://deno.com/) 2.8.3 — secure-by-default, first-class TypeScript, web-standard APIs |
| **Framework** | [SolidStart 2.0](https://start.solidjs.com/) (alpha) on [Nitro v2](https://nitro.build/) (`deno_server` preset), Vite 7 |
| **API** | [oRPC](https://orpc.unnoq.com/) — end-to-end type-safe RPC that doubles as an OpenAPI REST API |
| **Auth** | [Better Auth](https://better-auth.com/) — email/password, OAuth, passkeys, 2FA, SMS, admin |
| **Database** | [Drizzle ORM](https://orm.drizzle.team/) over [LibSQL/Turso](https://turso.tech/) (local SQLite file in dev) |
| **UI** | [shadcn-style](https://solid-ui.com/) components ported to Solid on [Kobalte](https://kobalte.dev/) + [Tailwind CSS v4](https://tailwindcss.com/) |
| **Storage** | S3-compatible object storage ([RustFS](https://rustfs.com/) locally via Docker) for avatars |
| **Email / SMS** | [Resend](https://resend.com/) transactional email, [seven.io](https://www.seven.io/) SMS |
| **Bot defense** | [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) captcha + [HaveIBeenPwned](https://haveibeenpwned.com/) breached-password checks |
| **Logging** | [Pino](https://getpino.io/) (pretty in dev, JSON in prod), wired into the oRPC HTTP handler |

Validation is [Zod](https://zod.dev/) everywhere — env vars, form inputs, and the oRPC request/response contracts.

## ✨ Features

**Authentication & accounts** (Better Auth)
- Email/password sign-up with **email OTP verification** and breached-password rejection (HaveIBeenPwned)
- **Social login** — Google (with account-select prompt) and GitHub, with trusted-provider account linking
- **Passkeys** (WebAuthn) — register and sign in passwordless
- **Two-factor auth** — TOTP authenticator enrollment via QR code, copyable backup codes, optional "trust this device"
- **Phone/SMS OTP** via seven.io
- **Cloudflare Turnstile** captcha on all credential flows
- **Admin console** — searchable/paginated user directory, role management, user **impersonation**, and deletion
- The **first registered user is automatically promoted to admin**
- Self-service account center: change name/email/phone, upload avatar, change password, manage 2FA & passkeys, view and revoke active sessions, and request account deletion

**Type-safe API** (oRPC)
- A single router is the source of truth for both an **in-process RPC client** (used by SSR server functions, no HTTP) and a full **OpenAPI REST API** mounted at `/api`
- Interactive [Scalar](https://scalar.com/) API docs auto-generated at **`/api/docs`** (spec at `/api/spec.json`), combining the app API and Better Auth's own schema
- Drizzle-Zod schemas are reused directly as oRPC input/output, so DB types, validation, and the REST surface never drift

**Polished UI**
- ~60 shadcn-style components ported to SolidJS on Kobalte primitives (plus Ark UI, Corvu, cmdk, Embla for specific widgets)
- Light/dark/system theming via Kobalte color-mode with **SSR cookie persistence (no flash)**
- Tailwind v4 (CSS-first, no `tailwind.config.js`), `class-variance-authority` variants, toasts via `solid-sonner`, icons via `unplugin-icons` (Lucide + Simple Icons)

**Demo product surface**
- A personal **task manager** (create / toggle / delete with a completion progress bar) wired through the full query/action data-flow as a working example

## ✅ Prerequisites

- **[Deno](https://deno.com/) 2.8.3** — pinned in `mise.toml` and `nixpacks.toml`. Installing [mise](https://mise.jdx.dev/) is recommended so the exact version resolves automatically.
  > This project runs **only on Deno**. Never use `npm` / `pnpm` / `yarn` / `bun` — dependencies are `npm:`/`jsr:` specifiers in `deno.json` with `nodeModulesDir: "manual"`.
- **Docker + Docker Compose** — runs the local [RustFS](https://rustfs.com/) S3 container for avatar storage. Without it, avatar upload/delete won't work locally.
- Accounts/credentials for the [external services](#-external-services) below. By default `src/env.ts` validates **all** of them as required and the app/build will refuse to start until they're set (see [Gotchas](#-gotchas--constraints) for making providers optional).

## 🚀 Quick start

```sh
# 1. Clone
git clone https://github.com/ptzburn/solidstart-starter.git
cd solidstart-starter

# 2. Install the pinned Deno (via mise), or install Deno 2.8.3 yourself
mise install

# 3. Configure environment — copy the example and fill in your secrets
cp .env.example .env
#    See the "Environment variables" and "External services" sections below.

# 4. Install dependencies
deno install

# 5. Create the local SQLite database and apply migrations
deno task db:migrate

# 6. Start everything — Vite app on :3020 + RustFS S3 container together
deno task dev
```

Then, on first run:

1. **Create the storage bucket.** Open the RustFS console at <http://localhost:9001>, log in with your `RUSTFS_ACCESS_KEY` / `RUSTFS_SECRET_KEY`, and create a bucket matching `S3_BUCKET` (default: `tasks`). Avatar uploads target this bucket.
2. **Register the first user** at <http://localhost:3020/auth/sign-up> — this account is **automatically made an admin** and can reach the admin console at `/dashboard/admin/users`.

> Prefer to run things separately? Use `deno task dev:app` (app only) and `deno task dev:docker` (storage only) in two terminals.

## 🔐 Environment variables

All variables are validated by **Zod at startup** (`src/env.ts`, also imported by `vite.config.ts`), so a missing value fails the build/boot immediately with a list of what's missing.

- Variables prefixed with **`VITE_`** are **public** — they are bundled into the client. Never put a secret behind a `VITE_` prefix.
- Everything else is **server-only**.
- Use `.env` for development and `.env.prod` for `build` / `start` / `db-prod:*`.

| Variable | Scope | Required | Notes |
| --- | --- | --- | --- |
| `NODE_ENV` | server | – | `development` \| `test` \| `production` (default `development`) |
| `LOG_LEVEL` | server | – | Pino level, default `info` |
| `VITE_HOST_URL` | **public** | ✅ | App origin, e.g. `http://localhost:3020`; used for passkey RP ID, CSP, email links |
| `DATABASE_URL` | server | ✅ | `file:local.db` in dev; a Turso `libsql://…` URL in prod |
| `DATABASE_AUTH_TOKEN` | server | ✅ | Leave empty in dev (ignored when `NODE_ENV=development`); Turso token in prod |
| `BETTER_AUTH_SECRET` | server | ✅ | Signs sessions and the short-lived multi-step auth cookies — use a strong random value |
| `BETTER_AUTH_URL` | server | ✅ | Better Auth base URL |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | server | ✅ | Google OAuth credentials |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | server | ✅ | GitHub OAuth App credentials |
| `VITE_TURNSTILE_SITE_KEY` | **public** | ✅ | Cloudflare Turnstile site key |
| `TURNSTILE_SECRET_KEY` | server | ✅ | Cloudflare Turnstile secret key |
| `RESEND_API_KEY` | server | ✅ | Resend API key |
| `RESEND_EMAIL` | server | ✅ | Verified Resend sender address |
| `SEVEN_IO_API_KEY` | server | ✅ | seven.io SMS API key |
| `S3_ENDPOINT` | server | ✅ | S3 endpoint URL (`http://localhost:9000` locally) |
| `S3_REGION` | server | ✅ | S3 region |
| `S3_ACCESS_KEY` / `S3_ACCESS_SECRET` | server | ✅ | S3 credentials |
| `S3_BUCKET` | server | ✅ | Bucket name (default `tasks`) |
| `VITE_S3_PUBLIC_URL` | **public** | ✅ | Public base URL for avatars (also whitelisted in the production CSP) |

**Docker-only** (consumed by `docker-compose.yml`, **not** validated by `src/env.ts`): `RUSTFS_ACCESS_KEY`, `RUSTFS_SECRET_KEY`, `RUSTFS_API_PORT` (default `9000`), `RUSTFS_CONSOLE_PORT` (default `9001`).

## 🔌 External services

| Service | Purpose | What to get |
| --- | --- | --- |
| **[Turso](https://turso.tech/)** (LibSQL) | Production database | Database URL + auth token. In dev you can skip it — use `DATABASE_URL=file:local.db` with an empty token. |
| **[Google Cloud Console](https://console.cloud.google.com/apis/credentials)** | Google OAuth | OAuth 2.0 client ID + secret |
| **[GitHub Developer Settings](https://github.com/settings/developers)** | GitHub OAuth | OAuth App client ID + secret |
| **[Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)** | Captcha on credential flows | Site key (public) + secret key |
| **[Resend](https://resend.com/)** | Transactional email (verify, reset, delete, email change, sign-up warning) | API key + a verified sender address |
| **[seven.io](https://www.seven.io/)** | Phone/SMS one-time codes | API key |
| **S3-compatible storage** | Avatar uploads | Locally provided by the bundled RustFS container; in production use AWS S3, Cloudflare R2, etc. (path-style addressing) |

## 🛠 Commands

All tasks run via `deno task <name>`.

| Task | Description |
| --- | --- |
| `deno task dev` | Run the app (Vite on **:3020**) **and** the RustFS storage container together |
| `deno task dev:app` | App only |
| `deno task dev:docker` | RustFS S3 container only (`docker compose up`) |
| `deno task build` | Production build (uses `.env.prod`) |
| `deno task start` | Serve the built `.output/server/index.mjs` (uses `.env.prod`) |
| `deno task check` | `deno fmt` + `deno lint` + `deno check` over `./src` — **run before committing** |
| `deno task db:generate` | Generate Drizzle migrations |
| `deno task db:migrate` | Apply migrations to the local DB |
| `deno task db:studio` | Drizzle Studio on **:8000** |
| `deno task db-prod:migrate` / `db-prod:studio` | Same, against `.env.prod` |
| `deno task deps:update` | `deno outdated --update --latest` (Vite is pinned and excluded) |
| `deno task audit` / `audit:fix` | Dependency vulnerability audit |

> There is **no test runner**. `deno task check` (format + lint + typecheck) is the quality gate, and it's also enforced as a `lefthook` pre-commit hook. Lint config is strict: explicit return types, `no-console` (use the `logger`), `no-non-null-assertion`, `no-await-in-loop`, `verbatim-module-syntax`, plus import-order and Tailwind lint plugins.

## 📁 Project structure

The import root `~/` maps to `./src/`, which is split three ways:

```
src/
├── api/          # server-only: oRPC router, Drizzle DB, services, email templates, middlewares
│   ├── router/   #   procedures (tasks, avatars) + builder + composition
│   ├── db/       #   schema, relations, migrations, the Drizzle client
│   ├── services/ #   files (S3 + image processing), emails (Resend)
│   ├── lib/      #   resend, seven-io clients
│   ├── emails/   #   transactional HTML email templates
│   └── middlewares/
├── client/       # frontend
│   ├── routes/   #   file-based routes (configured via routeDir); _components/ folders hold route-local UI
│   ├── components/ # ui/ shadcn ports + app composites
│   ├── queries/  #   cached server reads  (query() + "use server")
│   ├── actions/  #   mutations            (action() + "use server")
│   ├── contexts/ #   SessionProvider / useSession
│   ├── lib/      #   auth-client, SolidStart middleware, pending-session helpers
│   └── schemas/  #   Zod schemas for form inputs
└── shared/       # used by both: in-process oRPC client, auth config, logger, types
```

**Conventions**
- Route-local components live in leading-underscore `_components/` folders next to their route (SolidStart ignores them for routing).
- Pages **never** import the oRPC client directly — reads go through `queries/`, mutations through `actions/`.
- UI primitives in `components/ui/` are shadcn-style ports; keep **all** exported parts when editing, even unused ones.

## 🏗 Architecture

### oRPC API — one router, two consumers

Procedures are built from a `base` (`src/api/os.ts`) → `authProcedure` (`src/api/router/builder.ts`, which applies `authMiddleware` so **every procedure requires a session**). Each declares `.route({ method, path, tags })` plus Zod `.input`/`.output`, so the router is simultaneously a typed RPC surface and a documented REST API.

- **In-process (SSR):** `src/shared/orpc-client.ts` uses `createRouterClient` to call procedures directly — no HTTP. This is what `"use server"` functions use. Request headers are threaded in via `getServerHeaders()` so cookie-based auth works transparently.
- **Over HTTP:** `src/client/routes/api/[...rest].ts` mounts an `OpenAPIHandler` under `/api`, serves Scalar docs at `/api/docs` and the spec at `/api/spec.json`, and forwards `/api/auth/*` to Better Auth's handler.

REST surface: `GET/POST /tasks`, `GET/PATCH/DELETE /tasks/{id}` (tag `Tasks`), `POST/DELETE /avatars` (tag `Files`). DELETEs return `204`.

> The API is designed for **same-origin** use — no CORS plugin is configured. Cross-origin access would require adding one.

### Client data flow

Routes call typed wrappers, never the API client:

```ts
// read — src/client/queries/tasks.ts
export const getTasksQuery = query(async () => {
  "use server";
  return await orpcClient.tasks.list();
}, "tasks");

// write — src/client/actions/tasks.ts
export const createTaskAction = action(async (formData: FormData) => {
  "use server";
  const result = parseFields(NewTaskSchema, { name: formData.get("name") });
  if (result.fieldErrors) return { fieldErrors: result.fieldErrors };
  await orpcClient.tasks.create({ name: result.data.name, done: false });
  return { ok: true } as const;
}, "createTask");
```

The `"use server"` directive is what bridges the client route to the in-process `orpcClient` (and to `auth.api`) on the server. Forms validate with `parseFields` and return a uniform `{ fieldErrors }` (one message per field) or `{ ok: true }`. Auth navigations carry Set-Cookie through redirects via `redirectWithCookies()`. The session is fetched once in the dashboard layout and shared via `SessionProvider` / `useSession()`.

### Auth (two complementary guards)

- **SolidStart middleware** (`src/client/lib/middleware.ts`) enforces CSRF (Origin/Referer checks on unsafe methods), strict security headers + a production CSP, and **guest-only redirects** (logged-in users are bounced from `/` and `/auth/*` to `/dashboard`, except `/auth/sign-out`).
- **oRPC `authMiddleware`** (`src/api/middlewares/auth.ts`) returns `401` for any unauthenticated procedure call.

The Better Auth server config (`src/shared/auth.ts`) and client (`src/client/lib/auth-client.ts`) **must keep their plugin lists in sync**. Sessions last 3 days (refresh after 1 day) with a 5-minute signed cookie cache.

### Database

A single Drizzle client (`src/api/db/index.ts`) over LibSQL/Turso switches by environment: a local `file:local.db` (no token) in development, a Turso URL + token otherwise. Schema lives in `src/api/db/schema/` (`task.ts`, `auth.ts`) with relations in `relations.ts`. Better Auth uses `usePlural: true` and **serial integer IDs**, so `user.id` is a numeric string — note the `Number(context.user.id)` coercions in routers. Drizzle-Zod schemas (`SelectTaskSchema`, `InsertTaskSchema`, `UpdateTaskSchema`) are reused as the oRPC contracts.

### Files & storage

Avatar upload/delete goes through the oRPC `avatars` router → `src/api/services/files.ts` → S3 (`@aws-sdk/client-s3`), backed locally by RustFS. Images are resized to a max width of **400px** and re-encoded to **WebP** with `@cf-wasm/photon`, stored at `users/{userId}/avatar/{uuid}.webp`. The DB stores the relative key; the public URL is built from `VITE_S3_PUBLIC_URL`.

## 🗄 Database & migrations

```sh
# after editing schema in src/api/db/schema/*
deno task db:generate     # generate a new migration
deno task db:migrate      # apply it locally (file:local.db)
deno task db:studio       # browse data at http://localhost:8000

# production (uses .env.prod / Turso)
deno task db-prod:migrate
```

Migrations live one-directory-per-migration under `src/api/db/migrations/` (each with `migration.sql` + `snapshot.json`). Drizzle-kit is configured with the `turso` dialect in `drizzle.config.ts`.

## 🚢 Deployment

The repo ships a **[Nixpacks](https://nixpacks.com/)** config (`nixpacks.toml`) — suitable for hosts like Railway, Coolify, etc. It:

1. installs Deno 2.8.3 via the official install script,
2. runs `deno ci` to install locked dependencies,
3. builds with `deno task build` (Nitro `deno_server` preset → `.output/server/index.mjs`), and
4. serves with `deno task start`.

Both `build` and `start` load `.env.prod`, so populate it with your production secrets, a Turso `DATABASE_URL` + `DATABASE_AUTH_TOKEN`, and a production S3 provider. Make sure `VITE_HOST_URL` / `BETTER_AUTH_URL` point at your deployed origin (they drive passkey RP IDs, the CSP, and email links).

## 🎨 Make it yours

This template is meant to be forked and rebranded. Common first edits:

- **Rebrand** — replace "Solid Starter Template" / "TaskApp" strings (`src/shared/auth.ts`, email templates, `site-header`/`site-footer`, landing page) and the favicon/background in `public/`.
- **Rename the cookie prefix** — `COOKIE_PREFIX` (`solid-starter-template`) in `src/shared/auth.ts`, and the matching `lastLoginMethod` cookie name in **both** `auth.ts` and `auth-client.ts`.
- **Drop the demo** — remove the `tasks` router, schema, queries/actions, and the `/dashboard` task UI if you don't need them.
- **Phone OTP region** — the phone validator is hardcoded to Finnish `+358` numbers (`src/shared/auth.ts`); change the regex for your locale.
- **Make providers optional** — if you don't need Google/GitHub/Turnstile/Resend/seven.io/S3, relax the corresponding fields in `src/env.ts` (e.g. `.optional()`) and disable the related Better Auth plugins.
- **Keep plugin lists in sync** — any Better Auth plugin you add on the server (`auth.ts`) usually needs its client counterpart (`auth-client.ts`).

## ⚠️ Gotchas & constraints

- **SolidStart 2.0.0-alpha.3** — expect churn. Two custom Vite plugins in `vite.config.ts` (`deno-ssr-stream-fix`, `solid-start-manifest-query-preserve`) work around alpha bugs; re-test them when upgrading.
- **All env vars are required by default** — `src/env.ts` validates every service credential, so the app and even the Vite build won't start until they're filled. Relax `env.ts` if you want optional providers.
- **`user.id` is a numeric string** — Better Auth issues serial integer IDs as strings; coerce with `Number(...)` before DB queries.
- **Phone OTP is Finnish-only** (`+358`) until you change the validator.
- **No CORS** on the API — it's same-origin by design.
- **No test runner** — `deno task check` is the gate (also a pre-commit hook).

## 📄 License

[MIT](./LICENSE) © 2026 Milan Hokkanen.

Built by [ptzburn](https://github.com/ptzburn). Standing on the shoulders of [SolidStart](https://start.solidjs.com/), [oRPC](https://orpc.unnoq.com/), [Better Auth](https://better-auth.com/), [Drizzle](https://orm.drizzle.team/), [Kobalte](https://kobalte.dev/) / [solid-ui](https://solid-ui.com/), and [RustFS](https://rustfs.com/).
