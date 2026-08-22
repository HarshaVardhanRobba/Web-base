"use client"

import * as React from "react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function WorkflowMenu({ workflows }: { workflows: string[] }) {
  const [activeWorkflow, setActiveWorkflow] = React.useState(workflows[0])

  return (
    <SidebarMenu>
      {workflows.map((workflow) => (
        <SidebarMenuItem key={workflow}>
          <SidebarMenuButton
            isActive={workflow === activeWorkflow}
            onClick={() => setActiveWorkflow(workflow)}
          >
            <span>{workflow}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
