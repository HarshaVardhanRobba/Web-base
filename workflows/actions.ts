"use server";

import {auth} from "@clerk/nextjs/server";
import {Liveblocks, LiveblocksError} from "@liveblocks/node";
import {configure, tasks} from "@trigger.dev/sdk";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

import type {helloWorldTask} from "@/src/trigger/example";
import {createWorkflow, deleteWorkflow} from "@/workflows/test-data-lib/data";

// This project stores the Trigger.dev secret key as TRIGGER_KEY, while the SDK
// looks for TRIGGER_SECRET_KEY by default.
configure({
  secretKey: process.env.TRIGGER_SECRET_KEY ?? process.env.TRIGGER_KEY,
});

if (!process.env.LIVEBLOCKS_SECRET_KEY) {
  throw new Error("LIVEBLOCKS_SECRET_KEY is not set");
}

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY,
});

export async function createWorkflowAction(name: string) {
  const {orgId} = await auth();

  if (!orgId) {
    throw new Error("No active organization");
  }

  const workflow = await createWorkflow(orgId, name);

  revalidatePath("/workflows", "layout");

  // redirect() throws NEXT_REDIRECT, so it stays outside any try/catch.
  redirect(`/workflows/${workflow.id}`);
}

export async function deleteWorkflowAction(id: string) {
  const {orgId} = await auth();

  if (!orgId) {
    throw new Error("No active organization");
  }

  // The delete is scoped to the organization, so a workflow owned by another one
  // matches nothing and comes back undefined.
  const workflow = await deleteWorkflow(orgId, id);

  if (!workflow) {
    throw new Error("Workflow not found");
  }

  // The room shares the id of the workflow, and it holds the canvas, so it goes
  // with the row. A room is only created once someone opens the workflow, so a
  // workflow that was never opened has none, which is what the 404 means here.
  try {
    await liveblocks.deleteRoom(id);
  } catch (error) {
    if (!(error instanceof LiveblocksError) || error.status !== 404) {
      throw error;
    }
  }

  revalidatePath("/workflows", "layout");

  // redirect() throws NEXT_REDIRECT, so it stays outside any try/catch.
  redirect("/");
}

export async function runWorkflowAction(message?: string) {
  const {orgId} = await auth();

  if (!orgId) {
    throw new Error("No active organization");
  }

  // Trigger by id with a type-only import, so the task instance never gets
  // bundled into the server action.
  const handle = await tasks.trigger<typeof helloWorldTask>("hello-world", {
    message,
  });

  // The handle carries a Public Access Token already scoped to read this one
  // run, which is what the client needs to subscribe in realtime.
  return {runId: handle.id, publicAccessToken: handle.publicAccessToken};
}
