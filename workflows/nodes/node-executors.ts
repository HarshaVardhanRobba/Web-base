import type { Stagehand } from "@browserbasehq/stagehand"

import type { NodeType } from "./settings"

import { act } from "./executors/act"
import { agent } from "./executors/agent"
import { extract } from "./executors/extract"
import { openUrl } from "./executors/open-url"

// What an executor is handed: the values typed into the node, plus a browser
// that only starts once some node asks for it.
export type NodeContext = {
  values: Record<string, string>
  getStagehand: () => Promise<Stagehand>
}

// The return value is a short string for the logs panel and run metadata, or
// undefined when the node produced nothing worth showing.
export type NodeExecutor = (ctx: NodeContext) => Promise<string | undefined>

// One entry per node type in the registry, so adding a node means adding an
// entry here and nothing else. Total record, not Partial: leaving a registered
// node type out is a type error rather than a run that silently skips it.
export const nodeExecutors: Record<NodeType, NodeExecutor> = {
  // The trigger only marks where the graph starts, so there is nothing to do
  // and no browser to open for it.
  start: async () => undefined,

  "open-url": async ({ values, getStagehand }) =>
    openUrl({ stagehand: await getStagehand(), url: values.url }),

  act: async ({ values, getStagehand }) =>
    act({ stagehand: await getStagehand(), instruction: values.instruction }),

  extract: async ({ values, getStagehand }) =>
    extract({
      stagehand: await getStagehand(),
      instruction: values.instruction,
    }),

  agent: async ({ values, getStagehand }) =>
    agent({ stagehand: await getStagehand(), goal: values.goal }),
}
