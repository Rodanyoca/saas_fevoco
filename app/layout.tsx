import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
