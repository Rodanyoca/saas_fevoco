"use client"

import { Bell, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border">
      <div>
        <h1 className="text-xl font-bold text-card-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Recherche */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher..."
            className="pl-9 w-64 bg-background"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-secondary rounded-full" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Profil utilisateur */}
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
          <span className="sr-only">Profil</span>
        </Button>
      </div>
    </header>
  )
}
