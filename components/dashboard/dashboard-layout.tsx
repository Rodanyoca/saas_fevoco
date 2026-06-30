"use client"

import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="sticky top-0 h-screen shrink-0">
        <Sidebar />
      </div>
      <main className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  )
}
