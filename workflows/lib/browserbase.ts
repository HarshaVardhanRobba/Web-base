import { Stagehand } from "@browserbasehq/stagehand"

// A Browserbase session id resolves to its Live View while the run is going and
// to the replay, logs, and network afterwards.
export function sessionUrl(sessionId: string) {
  return `https://www.browserbase.com/sessions/${sessionId}`
}

export type BrowserHandle = {
  // Starts the cloud browser on the first call and hands back the same one
  // after that, so every node in a run shares a session and a page one node
  // opened is still open for the node after it.
  getStagehand: () => Promise<Stagehand>
  // Undefined until some node has actually asked for the browser.
  sessionId: () => string | undefined
  close: () => Promise<void>
}

// Lazy on purpose: a graph of nodes that never touch a browser costs no session.
export function createBrowser(): BrowserHandle {
  let started: Promise<Stagehand> | undefined
  let stagehand: Stagehand | undefined

  return {
    getStagehand: () => {
      if (!started) {
        started = (async () => {
          if (!process.env.BROWSERBASE_API_KEY) {
            throw new Error("BROWSERBASE_API_KEY is not set")
          }

          if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not set")
          }

          // A Browserbase context carries cookies and local storage between
          // sessions, so a site logged into once stays logged in on later runs
          // rather than every run starting at a login wall. persist writes any
          // new cookies back at the end of the session. Both env vars have to
          // be set for it, since a context is addressed within its project.
          const contextId = process.env.BROWSERBASE_CONTEXT_ID
          const projectId = process.env.BROWSERBASE_PROJECT_ID

          const withContext =
            contextId && projectId
              ? {
                  browserbaseSessionCreateParams: {
                    projectId,
                    browserSettings: {
                      context: { id: contextId, persist: true },
                    },
                  },
                }
              : {}

          // Leaving model unset would route LLM calls through Stagehand Model
          // Gateway on the Browserbase key, but that free trial period has
          // expired for this account, so calls go straight to OpenAI instead.
          const instance = new Stagehand({
            env: "BROWSERBASE",
            apiKey: process.env.BROWSERBASE_API_KEY,
            model: {
              modelName: "openai/gpt-4.1-mini",
              apiKey: process.env.OPENAI_API_KEY,
            },
            ...withContext,
            verbose: 0,
            // Pino spawns its transport in a worker thread loaded by file
            // path, and that path does not survive the Trigger.dev bundle, so
            // the run dies with "Cannot find module .../lib/worker.js" before
            // any browser opens. Stagehand logs through the plain logger
            // instead when this is set.
            disablePino: true,
            // A cached act() replays without an LLM call. The directory lives
            // on the machine running the task, so this pays off across steps
            // and across local dev runs rather than across deployed ones.
            cacheDir: ".stagehand-cache",
          })

          await instance.init()
          stagehand = instance

          return instance
        })()
      }

      return started
    },

    sessionId: () => stagehand?.browserbaseSessionID,

    close: async () => {
      await stagehand?.close()
    },
  }
}
