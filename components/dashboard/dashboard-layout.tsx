"use client"

import { useState } from "react"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Sidebar } from "./sidebar"
import { Button } from "@/components/ui/button"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <div className="sticky top-0 hidden h-screen shrink-0 md:block">
        <Sidebar />
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation principale">
          <button className="absolute inset-0 bg-foreground/45" aria-label="Fermer la navigation" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-[min(18rem,86vw)] shadow-2xl">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
            <Button variant="ghost" size="icon" className="absolute right-2 top-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={() => setMobileOpen(false)} aria-label="Fermer la navigation">
              <X />
            </Button>
          </div>
        </div>
      )}
      <main className="min-w-0 flex-1">
        <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Ouvrir la navigation"><Menu /></Button>
          <Image src="/logo-fevoco.png" alt="Logo FEVOCO" width={34} height={34} className="size-8 object-contain" priority />
          <span className="text-sm font-semibold tracking-wide">FEVOCO</span>
        </div>
        {children}
      </main>
    </div>
  )
}
