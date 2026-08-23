import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { createWorkflowAction } from "@/workflows/actions"
import { WorkflowNavigation } from "@/workflows/components/workflow-navigation"
import { listWorkflows } from "@/workflows/test-data-lib/data"

export async function SideBar() {
  const { orgId } = await auth()
  const workflows = orgId ? await listWorkflows(orgId) : []

  return (
    <Sidebar>
      <SidebarHeader className="flex-row items-center justify-between gap-2">
        <OrganizationSwitcher />
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <WorkflowNavigation
          workflows={workflows}
          createWorkflowAction={createWorkflowAction}
        />
      </SidebarContent>
      <SidebarFooter>
        <UserButton />
      </SidebarFooter>
    </Sidebar>
  )
}
