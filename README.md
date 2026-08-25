# web-base

A multi-tenant workflow builder built on Next.js 16 and React 19. Each
organization owns a set of workflows; a workflow opens in a node editor backed by
React Flow, and runs execute as durable Trigger.dev tasks that drive a cloud
browser while their progress streams back into the UI in realtime.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, React 19) |
| Auth and tenancy | Clerk, including organizations |
| Database | Neon Postgres over `@neondatabase/serverless`, Drizzle ORM |
| Background jobs | Trigger.dev v4 (`@trigger.dev/sdk`, `@trigger.dev/react-hooks`) |
| Browser automation | Browserbase with Stagehand (`@browserbasehq/stagehand`) |
| Canvas | React Flow v12 (`@xyflow/react`) |
| Collaboration | Liveblocks (rooms back the canvas) |
| UI | shadcn/ui on Tailwind CSS v4, Base UI and Radix primitives, `next-themes` |
| Tests | Vitest |

## Prerequisites

Node 20 or newer, plus a free account on each of these five services. Create the
listed resource in each one before starting, and keep the tab open: step 3 below
collects a key from each.

| Service | What to create | Where the key lives |
| --- | --- | --- |
| [Clerk](https://dashboard.clerk.com) | An application, with **Organizations** enabled under Configure | API Keys |
| [Neon](https://console.neon.tech) | A Postgres project | Connection Details, both pooled and unpooled |
| [Trigger.dev](https://cloud.trigger.dev) | A project | Project settings, API Keys |
| [Browserbase](https://www.browserbase.com/overview) | An account (the default project is enough) | Settings, API Key |
| [Liveblocks](https://liveblocks.io/dashboard) | A project | API Keys, secret key |

Organizations must be turned on in Clerk. The whole app is scoped by
organization, so a user without one is redirected to `/choose-organization` and
cannot reach any workflow.

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/HarshaVardhanRobba/Web-base.git
cd Web-base
npm install
```

### 2. Point Trigger.dev at your own project

`trigger.config.ts` is committed with the project reference of the original
Trigger.dev project, which your account cannot deploy to. Replace it with the
reference from your project settings, which looks like `proj_abc123`:

```ts
// trigger.config.ts
export default defineConfig({
  project: "proj_your_own_reference_here",
  // leave the rest as it is
})
```

### 3. Create `.env.local`

Create a file named `.env.local` in the repository root. It is gitignored, so
nothing in it is ever committed. Fill in the values you collected above:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Neon
DATABASE_URL=postgresql://...-pooler...
DATABASE_URL_UNPOOLED=postgresql://...

# Trigger.dev
TRIGGER_SECRET_KEY=tr_dev_...

# Browserbase
BROWSERBASE_API_KEY=bb_live_...

# Liveblocks
LIVEBLOCKS_SECRET_KEY=sk_dev_...
```

Every variable above is required. Most fail loudly with a named error the moment
the module that needs them loads, but two fail later and are worth knowing about:
`BROWSERBASE_API_KEY` is read only when a node first opens the browser, and the
Trigger.dev key has no guard at all, so a missing one surfaces as an
authentication failure when a run is triggered.

Two notes on the values. `DATABASE_URL` must be the **pooled** Neon string, the
one whose host contains `-pooler`, because it is used at runtime; drizzle-kit
uses `DATABASE_URL_UNPOOLED` for migrations, since a pooled connection cannot run
DDL. And the Trigger.dev key is read as `TRIGGER_SECRET_KEY`, with `TRIGGER_KEY`
accepted as a fallback for older setups.

### 4. Create the database tables

```bash
npm run db:migrate
```

This applies the SQL in `drizzle/` to the database behind
`DATABASE_URL_UNPOOLED`. Run `npm run db:studio` afterwards if you want to see
the tables in a browser.

### 5. Run both processes

The app needs two terminals. Next.js serves the UI, and the Trigger.dev dev
server runs the background tasks that execute workflows. A workflow run does
nothing at all without the second process.

```bash
# terminal 1
npm run dev

# terminal 2
npx trigger.dev@latest dev
```

The first `npx trigger.dev` run opens a browser to authenticate the CLI against
your Trigger.dev account and links the directory to the project reference set in
step 2.

Open http://localhost:3000, sign up, create an organization when Clerk asks for
one, and you land on the workflow list.

### 6. Run your first workflow

Create a workflow, then on the canvas:

1. Drag an **Open URL** node out and connect the **Start** node to it.
2. Select the Open URL node and type a full URL, including the scheme, such as
   `https://example.com`, into the URL field on the right.
3. Press **Run**.

Steps light up as they execute, and a Browserbase Live View link appears once the
first node opens the browser, so you can watch the session while it runs.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build, preceded by `check:trigger` |
| `npm run start` | Serve the production build |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Rerun tests on change |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier over every `.ts` and `.tsx` file |
| `npm run check:trigger` | Verify the Trigger.dev worker bundle stays clean |
| `npm run db:generate` | Generate a migration from the Drizzle schema |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:push` | Push the schema straight to the database |
| `npm run db:studio` | Drizzle Studio |
| `npx trigger.dev@latest dev` | Trigger.dev dev server, required for any run to execute |

## Tests

Vitest picks up any file matching `*.test.ts`, so a new test needs no
registration; put it next to the code it covers and run `npm test`.

The suite deliberately stays on pure functions that touch no browser, database,
or network, which is why it finishes in seconds:

- `workflows/lib/interpolate.test.ts` covers `{{ node.field }}` resolution,
  including dead paths and nested values.
- `workflows/lib/graphvalidator.test.ts` covers the structural rules a graph must
  satisfy before it runs.
- `workflows/nodes/parity.test.ts` asserts the node registry and the executor map
  hold the same set of node types, so a half-added node type fails a test rather
  than shipping.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Run stays pending forever | The `npx trigger.dev@latest dev` process is not running |
| `BROWSERBASE_API_KEY is not set` | Missing from `.env.local`; it is read only when a node first opens the browser, so earlier steps succeed before this appears |
| Redirected to `/choose-organization` in a loop | Organizations are not enabled in the Clerk dashboard |
| Migration fails on a pooled connection | `DATABASE_URL_UNPOOLED` is pointing at the `-pooler` host |
| Task id not found when running | `trigger.config.ts` still holds the original project reference, or the CLI is linked to a different project |

## Layout

```
app/
  (auth)/                     Clerk sign-in and sign-up catch-all routes
  (dashboard)/                Sidebar shell; workflow list and /workflows/[id]
  api/liveblocks/auth/        Liveblocks room authentication endpoint
  choose-organization/        Clerk task screen for picking an organization
  layout.tsx                  ClerkProvider, ThemeProvider, fonts, Toaster
components/
  ui/                         shadcn/ui primitives
  side-bar.tsx                Organization switcher plus the workflow list
lib/
  db/schema.ts                Drizzle tables and inferred row types
  db/index.ts                 Neon client for Next server code
  db/client.ts                The same client without the server-only guard
workflows/
  actions.ts                  Server actions: create a workflow, trigger a run
  components/                 Canvas, node renderer, resizable shell, run feedback
  lib/browserbase.ts          Lazy Browserbase session shared across a run
  lib/graphvalidator.ts       Structural checks run before a workflow starts
  lib/interpolate.ts          Placeholder resolution between nodes
  nodes/settings.ts           Node registry: one entry per node type
  nodes/node-executors.ts     One executor per node type
  tasks/run-workflow.ts       The Trigger.dev task that walks the graph
  test-data-lib/data.ts       Org-scoped queries against the workflows table
src/trigger/                  Additional Trigger.dev task definitions
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
`nodeRegistry` in `workflows/nodes/settings.ts`. Node data stays plain JSON so it
persists to the `graph` column and syncs through a Liveblocks room that shares
the id of the workflow.

Runs go through `runWorkflowAction`, which saves the graph, validates it, and
triggers the `run-workflow` task by id, returning the run id together with a
public access token scoped to that single run. The client passes both to
`useRealtimeRun`, so status updates stream in without polling.

Inside the task, `toposort` orders the connected nodes, and each one runs in
turn against a single Browserbase session opened lazily by the first node that
needs a browser. Each node writes its result into an outputs map keyed by node
id, which is what a later node reaches through a `{{ nodeId.field }}`
placeholder. A failed step stops the run rather than letting the rest of the
graph execute against an unexpected page.

## Adding a workflow node

Three edits, all under `workflows/nodes/`:

1. The executor file, such as `executors/open-url.ts`.
2. Register it in `node-executors.ts`; the `satisfies` contract makes a missing
   executor a compile error.
3. Add its manifest entry in `settings.ts`: kind, label, icon, accent, its input
   `fields`, and the `outputs` downstream nodes can reference.

The run task and the canvas step node are registry-driven, so neither needs
touching to add a node. `npm test` fails if steps 2 and 3 disagree.

## Adding UI components

```bash
npx shadcn@latest add button
```

Components land in `components/ui` and import as `@/components/ui/button`.

## Conventions

See [AGENTS.md](AGENTS.md) for the rules this codebase follows: derive types from
the Drizzle schema rather than hand-writing row shapes, avoid apostrophes in
source text, keep the Trigger.dev worker free of Next.js imports, and check the
installed docs before using Next.js or React Flow APIs, since both differ from
older versions.
