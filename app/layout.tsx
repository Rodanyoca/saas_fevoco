import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { DashboardShell } from "@/components/dashboard/dashboard-layout"
import { dashboardNavigation } from "@/lib/navigation"
import { filterNavigation } from "@/lib/auth/navigation-access"
import { getNavigationAccess, getSession } from "@/lib/auth"
import { Toaster } from "@/components/ui/sonner"

const geist = localFont({
  src: './fonts/geist-latin.woff2',
  variable: '--font-geist-sans',
  display: 'swap',
  weight: '100 900',
})

const geistMono = localFont({
  src: './fonts/geist-mono-latin.woff2',
  variable: '--font-geist-mono',
  display: 'swap',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'FEVOCO - Système de Gestion',
  description: 'Plateforme de gestion de la Fédération de Volleyball du Congo',
  generator: 'DS Concept',
  icons: {
    icon: [{ url: '/logo-fevoco.png', type: 'image/png' }],
    shortcut: '/logo-fevoco.png',
    apple: '/logo-fevoco.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession()
  const navigation = filterNavigation(dashboardNavigation, session && !session.doitChangerMotDePasse
    ? { estSuperAdmin: session.estSuperAdmin, access: await getNavigationAccess(session) }
    : null)
  return (
    <html lang="fr">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <DashboardShell navigation={navigation}>{children}</DashboardShell>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
