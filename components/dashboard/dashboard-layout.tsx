"use client"

import { createContext, useContext, useState } from "react"
import { usePathname } from "next/navigation"
import type { NavigationItem } from "@/lib/navigation"
import { DashboardNavigationProvider } from "./dashboard-navigation-context"
import { Sidebar } from "./sidebar"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"

interface DashboardLayoutProps {
  children: React.ReactNode
  navigation?: readonly NavigationItem[]
}

const DashboardFrameContext = createContext(false)
const standaloneRoutes = new Set(["/login", "/activation", "/service-indisponible", "/acces-refuse", "/mon-compte"])

/** The root layout owns this shell, so route transitions retain its state. */
export function DashboardShell({ children, navigation = [] }: DashboardLayoutProps) {
  const pathname = usePathname()
  if (standaloneRoutes.has(pathname)) return <>{children}</>
  return <DashboardLayout navigation={navigation}>{children}</DashboardLayout>
}

/** Existing page/loading wrappers reuse the root frame instead of mounting one. */
export function DashboardLayout({ children, navigation = [] }: DashboardLayoutProps) {
  const insideFrame = useContext(DashboardFrameContext)
  if (insideFrame) return <>{children}</>
  return <DashboardFrame navigation={navigation}>{children}</DashboardFrame>
}

function DashboardFrame({ children, navigation = [] }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <DashboardFrameContext.Provider value={true}><div className="flex min-h-dvh bg-background">
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
    </div></DashboardFrameContext.Provider>
  )
}
