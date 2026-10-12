"use client"

import { useEffect, useState } from "react"
import { filterNavigation, type NavigationAccess } from "@/lib/auth/navigation-access"
import { dashboardNavigation } from "@/lib/navigation"
import { apiFetch } from "@/lib/api/client"
import { DashboardNavigationProvider } from "./dashboard-navigation-context"
import { Sidebar } from "./sidebar"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const [user, setUser] = useState<NavigationAccess | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    apiFetch("/api/auth/session", { signal: controller.signal }).then(async response => {
      if (!response.ok) return
      const result = await response.json()
      if (result.user && !result.user.doit_changer_mot_de_passe) setUser({ estSuperAdmin: result.user.est_super_admin, access: result.user.access })
    }).catch(() => undefined)
    return () => controller.abort()
  }, [])
  const navigation = filterNavigation(dashboardNavigation, user)
  return (
    <div className="flex min-h-dvh bg-background">
      <div className="sticky top-0 hidden h-dvh shrink-0 lg:block">
        <Sidebar navigation={navigation} />
      </div>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 max-w-[88vw] gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground [&_[data-slot=sheet-close]]:right-3 [&_[data-slot=sheet-close]]:top-5 [&_[data-slot=sheet-close]]:text-sidebar-foreground">
          <SheetTitle className="sr-only">Navigation principale</SheetTitle>
          <SheetDescription className="sr-only">Accéder aux modules de gestion FEVOCO</SheetDescription>
          <Sidebar navigation={navigation} collapsible={false} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
        <DashboardNavigationProvider value={() => setMobileOpen(true)}>
          <main className="min-w-0 flex-1">{children}</main>
        </DashboardNavigationProvider>
      </Sheet>
    </div>
  )
}
