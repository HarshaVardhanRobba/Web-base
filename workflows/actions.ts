"use server";

import {auth} from "@clerk/nextjs/server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

import {createWorkflow} from "@/workflows/test-data-lib/data";

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
