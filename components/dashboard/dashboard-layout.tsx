"use client"

import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="relative">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
