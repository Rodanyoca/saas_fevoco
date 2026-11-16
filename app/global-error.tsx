"use client"

import "./globals.css"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ServiceUnavailable } from "@/components/dashboard/service-unavailable"

// A failed root layout cannot supply its normal frame or navigation model.
// This display-only fallback still sends every destination through the proxy.
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <html lang="fr"><body className="font-sans antialiased"><DashboardLayout navigation={[{ name: "Tableau de bord", href: "/", icon: "dashboard" }]}><ServiceUnavailable retry={retry} /></DashboardLayout></body></html>
}
