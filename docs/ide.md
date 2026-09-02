# Development environment

## Machine

| Item | Value |
| --- | --- |
| OS | Windows 11 Home (10.0.26200) |
| Shells | PowerShell 5.1 for day-to-day work, Git Bash for POSIX commands |
| Git | 2.43.0.windows.1 |
| GitHub CLI | gh 2.74.2, authenticated as `HarshaVardhanRobba` |
| Node | 20 or newer, as the README requires |

## Editor

Visual Studio Code, with the Claude Code extension for agent-assisted work.

## Extensions

Grouped by what they do on this project.

### Directly used by this stack

| Extension | Why |
| --- | --- |
| `anthropic.claude-code` | Claude Code inside the editor |
| `dbaeumer.vscode-eslint` | Surfaces `eslint.config.mjs` violations while typing rather than at `npm run lint` |
| `esbenp.prettier-vscode` | Formats on save against the committed `.prettierrc` |
| `bradlc.vscode-tailwindcss` | Class name completion and hover previews for Tailwind CSS v4 |
| `csstools.postcss` | PostCSS syntax support for `postcss.config.mjs` |
| `dsznajder.es7-react-js-snippets` | React 19 component and hook snippets |
| `usernamehw.errorlens` | Puts TypeScript and ESLint diagnostics inline on the failing line |
| `prisma.prisma` | SQL and schema highlighting, useful when reading the generated files under `drizzle/` |
| `formulahendry.auto-rename-tag` | Keeps JSX tag pairs in sync |
| `xabikos.javascriptsnippets` | General JavaScript snippets |

### API and debugging

| Extension | Why |
| --- | --- |
| `humao.rest-client` | Sends requests to route handlers such as `/api/liveblocks/auth` from a `.http` file |
| `rangav.vscode-thunder-client` | GUI alternative for the same |
| `andrewbutson.vscode-jwt-decoder` | Reads Clerk session tokens while debugging auth |
| `wallabyjs.quokka-vscode` | Scratchpad for pure helpers such as `interpolate.ts` before writing the Vitest case |

### Design and general editing

`figma.figma-vscode-extension` for the reference screenshots under `designs/`,
`bracketpaircolordlw.bracket-pair-color-dlw`, `mohd-akram.vscode-html-format`,
`ritwickdey.liveserver`, `formulahendry.code-runner`,
`visualstudioexptteam.vscodeintellicode` and
`visualstudioexptteam.intellicode-api-usage-examples`.

### Installed for other projects, not used here

Java (`redhat.java`, the `vscjava.*` pack, `oracle.oracle-java`), Python
(`ms-python.*`, `ms-toolsai.jupyter*`), Go (`golang.go`), and the other assistants
(`codeium.codeium`, `curiousboxai.prode-agent`, `digitalbrainstem.javascript-ejs-support`,
`rodrigovallades.es7-react-js-snippets`). They are listed for completeness; nothing on
this project depends on them.

## Secrets

No secret is stored in this repository or in any editor setting file that is committed.
All keys for Clerk, Neon, Trigger.dev, Browserbase, and Liveblocks live in `.env.local`,
which `.gitignore` excludes. The Trigger.dev CLI keeps its own credentials outside the
repository after `npx trigger.dev@latest dev` authenticates, and the GitHub CLI token is
in the OS keyring, not on disk in the project.
