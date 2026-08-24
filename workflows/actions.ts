"use server";

import {auth} from "@clerk/nextjs/server";
import {Liveblocks, LiveblocksError} from "@liveblocks/node";
import {runs} from "@trigger.dev/sdk";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

import {triggerRunWorkflow} from "@/workflows/lib/trigger-run-workflow";
// Configures the SDK with this project key naming, for runs.cancel below.
import "@/workflows/lib/trigger-client";
import {createWorkflow, deleteWorkflow, saveWorkflowGraph} from "@/workflows/test-data-lib/data";

import {WorkflowGraph} from "@/lib/db/schema";


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

export async function runWorkflowAction({
  id,
  graph,
}: {
  id: string
  graph: WorkflowGraph
}) {
  const {orgId} = await auth();

  if (!orgId) {
    throw new Error("No active organization");
  }

  await saveWorkflowGraph({orgId, id, graph});

  // The helper owns both the id and the payload type, so this cannot end up
  // triggering some other task by mistake.
  const handle = await triggerRunWorkflow({workflowId: id, orgId});


  // The handle carries a Public Access Token already scoped to read this one
  // run, which is what the client needs to subscribe in realtime.
  return {runId: handle.id, publicAccessToken: handle.publicAccessToken};
}

export async function cancelWorkflowRunAction(runId: string) {
  const { orgId }= await auth()
  if (!orgId) throw new Error("No active organization")
  await runs.cancel(runId)
}