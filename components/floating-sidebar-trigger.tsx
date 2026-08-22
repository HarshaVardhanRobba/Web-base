"use client"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

export function FloatingSidebarTrigger() {
  const { isMobile, open, openMobile } = useSidebar()

  if (isMobile ? openMobile : open) {
    return null
  }

  return <SidebarTrigger className="absolute top-2 left-2 z-20" />
}
