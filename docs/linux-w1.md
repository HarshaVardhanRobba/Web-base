# Shell log - Week 1

Run in Git Bash on Windows 11, on branch `sprint-01/w1d1-docs`, before the sprint
documentation was committed. Paths are Git Bash style, so `C:\` appears as `/c/`.

## Where I started

```console
$ pwd
/c/Users/robba/OneDrive/Desktop/what

$ ls
Web-base
Week 1 D 1
Week 2 D 2
```

## Into the repository

```console
$ cd Web-base

$ pwd
/c/Users/robba/OneDrive/Desktop/what/Web-base

$ ls
AGENTS.md
CLAUDE.md
README.md
app
components
components.json
docs
drizzle
drizzle.config.ts
eslint.config.mjs
hooks
lib
liveblocks.config.ts
next.config.ts
package-lock.json
package.json
postcss.config.mjs
proxy.ts
public
removed-code.txt
scripts
skills-lock.json
src
trigger.config.ts
tsconfig.json
vitest.config.ts
workflows
worklog
```

`ls` hides dotfiles by default, so `.gitignore`, `.prettierrc`, `.claude/` and the
rest of the dot-prefixed entries are not in that listing. `ls -a` shows them.
`node_modules/` is absent because `npm install` had not been run yet at this point.

## Repository state

```console
$ git status
On branch sprint-01/w1d1-docs
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   README.md

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	docs/

no changes added to commit (use "git add" and/or "git commit -a")

$ git log -1 --oneline
a850cf3 updated readme
```

## Reading the output

- `pwd` prints the working directory. Every relative path in a command resolves
  against it, which is why the `cd` matters before anything else.
- `ls` lists the directory. The repository root here matches the Layout section of
  the README.
- `git status` is answering three questions at once: which branch I am on
  (`sprint-01/w1d1-docs`, not `main`), what is changed but not staged (the one-line
  README edit), and what git has never seen (`docs/`, listed as a single directory
  because none of the files inside it are tracked yet).
- `git log -1 --oneline` shows the tip commit, `a850cf3 updated readme`. Since the
  branch was cut from `main` and nothing was committed to it yet, this is still the
  commit `main` points at.
