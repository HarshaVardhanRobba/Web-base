import {and, eq, desc} from "drizzle-orm";

import {db} from "@/lib/db";
import {workflows} from "@/lib/db/schema";

export function listWorkflows(orgId: string) {
  return db
    .select()
    .from(workflows)
    .where(and(eq(workflows.orgId, orgId)))
    .orderBy(desc(workflows.createdAt));
}

export async function createWorkflow(orgId: string, name: string) {
  const [workflow] = await db
    .insert(workflows)
    .values({orgId, name})
    .returning();

  return workflow;
}
