# web-base

A multi-tenant workflow builder built on Next.js 16 and React 19. Each
organization owns a set of workflows; a workflow opens in a node editor backed by
React Flow, and runs execute as durable Trigger.dev tasks whose progress streams
back into the UI in realtime.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19) |
| Auth and tenancy | Clerk, including organizations |
| Database | Neon Postgres over `@neondatabase/serverless`, Drizzle ORM |
| Background jobs | Trigger.dev v4 (`@trigger.dev/sdk`, `@trigger.dev/react-hooks`) |
| Canvas | React Flow v12 (`@xyflow/react`) |
| UI | shadcn/ui on Tailwind CSS v4, Base UI and Radix primitives, `next-themes` |
| Collaboration | Liveblocks (installed, canvas sync not wired yet) |

## Getting started

Requirements: Node 20 or newer, a Neon database, a Clerk application, and a
Trigger.dev project.

```bash
npm install
# create .env.local with the variables listed below
npm run db:migrate
npm run dev
```

The app runs on http://localhost:3000. Background tasks need a second process:

```bash
npx trigger.dev@latest dev
```

### Environment

`.env.local` holds every secret. Nothing here is committed.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend key |
| `CLERK_SECRET_KEY` | Clerk backend key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in route, `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up route, `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Post sign-in landing route |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Post sign-up landing route |
| `DATABASE_URL` | Pooled Neon connection used at runtime |
| `DATABASE_URL_UNPOOLED` | Direct Neon connection used by drizzle-kit |
| `NEON_BRANCH` | Neon branch the local environment points at |
| `NEON_AI_GATEWAY_TOKEN` | Neon AI gateway credential |
| `NEON_AI_GATEWAY_BASE_URL` | Neon AI gateway endpoint |
| `TRIGGER_KEY` | Trigger.dev secret key; server actions also accept `TRIGGER_SECRET_KEY` |

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier over every `.ts` and `.tsx` file |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | Generate a migration from the Drizzle schema |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:push` | Push the schema straight to the database |
| `npm run db:studio` | Drizzle Studio |

## Layout

```
app/
  (auth)/                     Clerk sign-in and sign-up catch-all routes
  (dashboard)/                Sidebar shell; workflow list and /workflows/[id]
  choose-organization/        Clerk task screen for picking an organization
  layout.tsx                  ClerkProvider, ThemeProvider, fonts, Toaster
components/
  ui/                         shadcn/ui primitives
  side-bar.tsx                Organization switcher plus the workflow list
lib/
  db/schema.ts                Drizzle tables and inferred row types
  db/index.ts                 Neon HTTP client wired to Drizzle
workflows/
  actions.ts                  Server actions: create a workflow, trigger a run
  components/                 Canvas, node renderer, resizable shell, run feedback
  nodes/settings.ts           Node registry: one entry per node type
  test-data-lib/data.ts       Org-scoped queries against the workflows table
src/trigger/                  Trigger.dev task definitions
drizzle/                      Generated SQL migrations
designs/                      Reference screenshots for the editor UI
worklog/                      Implementation notes
```

## How it fits together

`proxy.ts` runs `clerkMiddleware()` over every non-asset route, so `auth()` is
available in server components and server actions. Every query in
`workflows/test-data-lib/data.ts` takes an `orgId` and filters on it, which is
what keeps one organization from reading another one. Users without an active
organization are sent to `/choose-organization` by the Clerk task URL configured
in the root layout.

The workflow editor is a resizable three-panel shell: the React Flow canvas, a
logs panel below it, and an inspector on the right. Nodes come from
`nodeRegistry` in `workflows/nodes/settings.ts`; adding a node type means adding
one entry there, with its label, icon, accent color, and editable fields. Node
data stays plain JSON so it can persist to the `graph` column and later sync
through Liveblocks.

Runs go through `runWorkflowAction`, which triggers a Trigger.dev task by id and
returns the run id together with a public access token scoped to that single run.
The client passes both to `useRealtimeRun`, so status updates stream in without
polling.

## Adding UI components

```bash
npx shadcn@latest add button
```

Components land in `components/ui` and import as `@/components/ui/button`.

## Conventions

See [AGENTS.md](AGENTS.md) for the rules this codebase follows: derive types from
the Drizzle schema rather than hand-writing row shapes, avoid apostrophes in
source text, and check the installed docs before using Next.js or React Flow
APIs, since both differ from older versions.
