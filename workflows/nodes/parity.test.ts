import { describe, expect, it } from "vitest"

import { nodeExecutors } from "./node-executors"
import { nodeRegistry } from "./settings"

describe("registry / executor parity", () => {
  it("has an executor for every action node in the registry", () => {
    const registryTypes = Object.keys(nodeRegistry)
    const executorTypes = Object.keys(nodeExecutors)

    expect(executorTypes.sort()).toEqual(registryTypes.sort())
  })
})
