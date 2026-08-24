import { configure } from "@trigger.dev/sdk"

// This project stores the Trigger.dev secret key as TRIGGER_KEY, while the SDK
// looks for TRIGGER_SECRET_KEY by default. Importing this module configures the
// SDK, so anything that triggers or reads runs picks up the key by importing it
// rather than by repeating the fallback.
configure({
  secretKey: process.env.TRIGGER_SECRET_KEY ?? process.env.TRIGGER_KEY,
})
