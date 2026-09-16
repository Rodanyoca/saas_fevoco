"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const handleLogout = () => {
    // Logique de déconnexion à implémenter avec la base de données
    console.log("Déconnexion")
  }

  return (
    <header className="relative flex min-h-20 flex-col items-start justify-between gap-3 border-b bg-card px-4 py-4 sm:flex-row sm:items-center sm:px-6">
      <span className="fevoco-brand-line absolute inset-x-0 top-0 h-0.5" aria-hidden="true" />
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-[-0.025em] text-card-foreground sm:text-2xl">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <Button 
        variant="outline" 
        onClick={handleLogout}
        className="hidden items-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive sm:flex"
      >
        <LogOut className="h-4 w-4" />
        <span>Déconnexion</span>
      </Button>
    </header>
  )
}
