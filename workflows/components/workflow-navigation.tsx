"use client"

import { PlusIcon, WorkflowIcon } from "lucide-react"
import { useTransition } from "react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import type { workflow } from "@/lib/db/schema"
import { WorkflowMenu } from "@/workflows/components/workflow-menu"
import { generateSlug } from "@/workflows/nameslugs"

export function WorkflowNavigation({
  workflows,
  createWorkflowAction,
}: {
  workflows: workflow[]
  createWorkflowAction: (name: string) => Promise<void>
}) {
  const { state } = useSidebar()
  const [isCreating, startCreating] = useTransition()

  const createWorkflow = () => {
    startCreating(async () => {
      await createWorkflowAction(generateSlug())
    })
  }

  if (state === "collapsed") {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Popover>
                <PopoverTrigger asChild>
                  <SidebarMenuButton>
                    <WorkflowIcon />
                    <span className="sr-only">Workflows</span>
                  </SidebarMenuButton>
                </PopoverTrigger>
                <PopoverContent side="right" align="start">
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={createWorkflow}
                        disabled={isCreating}
                      >
                        <span>New workflow</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                  <SidebarSeparator />
                  <WorkflowMenu workflows={workflows} />
                </PopoverContent>
              </Popover>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workflows</SidebarGroupLabel>
      <SidebarGroupAction
        title="New workflow"
        onClick={createWorkflow}
        disabled={isCreating}
      >
        <PlusIcon />
        <span className="sr-only">New workflow</span>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <WorkflowMenu workflows={workflows} />
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
