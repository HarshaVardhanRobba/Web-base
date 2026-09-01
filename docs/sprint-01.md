# Sprint 01 - Access, Stack, and the Level 1 Loop

**Owner:** Harsha Vardhan Robba (solo)
**Repository:** `HarshaVardhanRobba/Web-base` (private)
**Sprint window:** Week 1
**Default branch:** `main`

## Stack

| Concern | Choice |
| --- | --- |
| Language | TypeScript |
| Web framework | Next.js 16 (App Router) with React 19 - this is a web app, not a CLI |
| Auth and tenancy | Clerk, with organizations enabled |
| Database | Neon Postgres via `@neondatabase/serverless`, Drizzle ORM |
| Background jobs | Trigger.dev v4 |
| Browser automation | Browserbase with Stagehand |
| Canvas | React Flow v12 (`@xyflow/react`) |
| Collaboration | Liveblocks |
| UI | shadcn/ui on Tailwind CSS v4 |
| Test runner | Vitest (`npm test`, `npm run test:watch`) |

### How the app runs

Two processes, two terminals. The second one is not optional: a workflow run stays
pending forever without it.

```bash
# terminal 1 - Next.js dev server on http://localhost:3000
npm run dev

# terminal 2 - Trigger.dev dev server, executes the background workflow tasks
npx trigger.dev@latest dev
```

Secrets live in `.env.local`, which is gitignored and never committed. The list of
required variables is in [README.md](../README.md); no key values appear anywhere in
this repository.

## Domain

A multi-tenant workflow builder. Every organization owns its own set of workflows.
A workflow is built visually in a node editor, and running it executes the graph as
a durable background task that drives a cloud browser while progress streams back
into the UI in realtime.

The tenancy rule is the core domain constraint: every query is scoped by `orgId`, and
a user without an active organization is redirected to `/choose-organization` and
cannot reach any workflow.

This is the real product domain, so the fallback personal-delivery-system domain is
not used.

## Why this sprint matters

This sprint proves the loop end to end: I can get into the production-like repository,
state exactly what it is built on, plan work as a backlog someone else could pick up,
and ship a change through a branch, a commit, and a pull request. Every later sprint
assumes that loop already works. If access, the stack, or the branch-to-PR path is
still uncertain, then every estimate made after this point is a guess.

## Backlog

Items are ordered. Estimates are in focused hours.

### 1. Sprint 01 documentation and the Level 1 loop

**As a developer on this project, I can read `docs/` to learn the stack, the domain,
and the sprint plan, so that I can start work without reverse-engineering the codebase.**

- Done when: `docs/sprint-01.md`, `docs/ide.md`, `docs/linux-w1.md`, and
  `docs/standup-w1d1.md` exist on a branch, one Level 1 change is committed, and a pull
  request is open against `main`.
- Estimate: 2h

### 2. A failed run says which node failed and why

**As an operator, I can see the failing node and its error message inside the run logs
panel, so that I can fix a broken workflow without opening the Trigger.dev dashboard.**

- Done when: a run that fails on a node shows that node id and the error text in the
  logs panel; the run record persists both; a Vitest case covers the error being carried
  out of the executor rather than swallowed.
- Estimate: 6h

### 3. Rename a workflow from the list

**As an operator, I can rename a workflow from the sidebar list, so that a workspace of
ten workflows stays readable.**

- Done when: an inline rename persists through a server action in
  `workflows/actions.ts`, the action is scoped by `orgId` so no cross-organization
  rename is possible, and a Vitest case covers the org scoping.
- Estimate: 3h

### 4. Duplicate a workflow

**As an operator, I can duplicate an existing workflow, so that I can experiment on a
copy without risking one that already works.**

- Done when: duplicating copies the `graph` column into a new row with a new id in the
  same organization, the copy appears in the list with a distinct name, and the original
  is untouched.
- Estimate: 4h

### 5. A Wait node

**As an operator, I can drop a Wait node between two steps, so that a workflow can pause
for a page to settle before the next node runs.**

- Done when: an executor exists under `workflows/nodes/executors/`, it is registered in
  `node-executors.ts` and `settings.ts`, `workflows/nodes/parity.test.ts` passes, and a
  run visibly pauses for the configured duration.
- Estimate: 5h

### 6. A test that pins the tenancy boundary

**As an organization admin, I can be certain another organization cannot read my
workflows, so that the multi-tenant promise is enforced by a test and not by review.**

- Done when: a Vitest case asserts every exported query in
  `workflows/test-data-lib/data.ts` filters on `orgId`, and the case fails if a new query
  is added without that filter.
- Estimate: 4h

## Order and rationale

1 first, because the rest of the sprint depends on the branch-and-PR loop working.
2 next, because debugging blind is what slows every other item down. 3 and 4 are small,
self-contained wins that build familiarity with the server actions and the schema.
5 exercises the node registry, which is the extension point the product grows through.
6 last, because it is a guardrail rather than a feature, and it is worth writing once
the shape of the data layer is settled.

## Risks

| Risk | Impact | Response |
| --- | --- | --- |
| Five external services (Clerk, Neon, Trigger.dev, Browserbase, Liveblocks) must all be configured before the app runs at all | A whole day can go to setup instead of features | Follow the README setup order exactly; treat setup as its own timebox and raise a blocker at standup if it exceeds it |
| `trigger.config.ts` ships the original project reference, which another account cannot deploy to | Runs fail with a task-id-not-found error that looks like a code bug | Replace the reference before the first run, as the README step 2 says |
| The Trigger.dev dev server is a second process that is easy to forget | Runs sit pending and look like a hang | Keep both terminals in one window layout; the troubleshooting table names this symptom first |
| Estimates here are first-sprint estimates with no velocity history | Sprint may over- or under-commit | Track actual hours against these numbers and recalibrate in Sprint 02 |
| Solo owner, so there is no second reviewer | Mistakes reach `main` unreviewed | Every change goes through a branch and a pull request even when self-merged, so there is always a diff to read before merge |
