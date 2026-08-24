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

          // The Browserbase API key alone identifies the project, and leaving
          // model unset routes the LLM calls through Model Gateway on that same
          // key, so no provider key is needed.
          const instance = new Stagehand({
            env: "BROWSERBASE",
            apiKey: process.env.BROWSERBASE_API_KEY,
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
