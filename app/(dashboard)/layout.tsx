import { FloatingSidebarTrigger } from "@/components/floating-sidebar-trigger"
import { SideBar } from "@/components/side-bar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <SideBar />
      <SidebarInset>
        <FloatingSidebarTrigger />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
