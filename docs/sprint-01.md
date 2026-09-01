## Stack
Language: TypeScript. Framework: Next.js 16 (App Router) with React 19, web app. Test runner: Vitest. How to run: npm run dev for the Next.js server, plus npx trigger.dev@latest dev in a second terminal for background workflow runs.

## domain
A multi-tenant workflow builder — each organization owns a set of workflows; a workflow is built visually with a node editor, and runs execute as background tasks that can drive a browser.

## do-5
sprint proves i can ship a change end to end and plan code with real stack

## d0-7
vscode, claude code extension, Eslint, tailwind, 


## Task-by-task explanation

### 1 — Standup,
File: `docs/standup-w1d1.md` (in Web-base repo).
Yesterday = "program start" (day one, nothing prior). Today = clone repo, name stack/domain, write backlog, ship Level 1 through branch + PR. Blocker = none; git identity was unset, fixed repo-local.

### 2 — Name stack
Language TypeScript. Web framework Next.js 16 App Router + React 19 (web app, not CLI). Test runner Vitest. Run = two terminals: `npm run dev`, `npx trigger.dev@latest dev`. Second one not optional — runs hang pending without it. Pulled from repo package.json and README, not guessed.

### 3 — Name domain
Multi-tenant workflow builder. Org owns workflows; workflow built in node editor; run executes as durable background task driving cloud browser, progress streams to UI. Core constraint: every query scoped by orgId, no org means redirect to /choose-organization. Fallback personal-delivery-system domain not used — real product domain exists.

### 4 — Clone repo
`git clone https://github.com/HarshaVardhanRobba/Web-base.git` into `what/Web-base`.
Repo exists, private, no fallback local init needed. Treated production-like: no direct commit to main, everything through branch + PR.

### 5 — Write sprint-01.md (in Web-base repo)
Why it matters: sprint proves loop end to end — access, stack named, plan readable by someone else, change shipped branch-to-PR. Later sprints assume loop works.
Backlog, 6 items, "As X I can Y so that Z" form, each with done-when + hour estimate:
1. Sprint docs + Level 1 loop — 2h
2. Failed run names failing node and error in logs panel — 6h
3. Rename workflow from list, org-scoped — 3h
4. Duplicate workflow, copies graph to new row — 4h
5. Wait node — executor + registry + parity.test.ts passes — 5h
6. Test pinning tenancy boundary in data.ts — 4h
Owner: solo. Order + rationale written out. Risks: five external services block startup, trigger.config.ts ships foreign project ref, forgotten second terminal, first-sprint estimates have no velocity history, solo owner means no second reviewer.

### 6 — Branch, Level 1 change, commit, PR
Branch `sprint-01/w1d1-docs` cut from main.
Level 1 change = one line in README Layout block, adding `docs/` beside drizzle/, designs/, worklog/. Level 1 because it only documents a directory that now exists — no source, no config, no dependency touched, build and runtime cannot shift.
Commit `94a7a0d`, 5 files, 309 insertions.
PR https://github.com/HarshaVardhanRobba/Web-base/pull/1 against main, open. Remote host exists, so real PR — docs/pr-001.md fallback skipped.

### 7 — docs/ide.md (in Web-base repo)
Machine: Windows 11 Home, PowerShell + Git Bash, git 2.43.0, gh 2.74.2. Editor VS Code + Claude Code extension. Extensions read live from `code --list-extensions`, grouped: used-by-this-stack (ESLint, Prettier, Tailwind, PostCSS, Error Lens, Prisma), API/debug (REST Client, Thunder Client, JWT decoder, Quokka), design/general, installed-for-other-projects (Java, Python, Go) marked unused here.
Secrets: none in repo. Keys stay in gitignored .env.local; Trigger.dev CLI creds outside repo; gh token in OS keyring.

### 8 — Linux commands
`docs/linux-w1.md` (in Web-base repo). Real output pasted, not typed from memory, ran in Git Bash so paths show /c/.
pwd at status/, ls shows three entries, cd Web-base, pwd + ls again, then git status (on sprint-01/w1d1-docs, README modified, docs/ untracked) and git log -1 --oneline (a850cf3 updated readme). Ran before the commit, so log tip still points where main points.
Doc explains reading: ls hides dotfiles, node_modules/ absent (no npm install yet), git status answers three questions at once, docs/ collapses to one line because nothing inside tracked yet.

### 10 — Live-explain script
Changed one line in README Layout block, adding docs/ next to drizzle/ and worklog/. Level 1 because it documents a directory that now exists — no source, no config, no dependency touched, build and runtime cannot change. Stack is TypeScript on Next.js 16 App Router with React 19, Clerk for auth and organizations, Neon Postgres through Drizzle, Trigger.dev v4 for background runs, Browserbase for the browser, React Flow for canvas, Vitest for tests. Runs as two processes: npm run dev, and npx trigger.dev@latest dev in second terminal.
