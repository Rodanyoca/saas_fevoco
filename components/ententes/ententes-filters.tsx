"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"

export function EntentesFilters({
  search,
  ligue,
  statut,
  ligues,
  onSearchChange,
  onLigueChange,
  onStatutChange,
}: {
  search: string
  ligue: string
  statut: string
  ligues: string[]
  onSearchChange: (value: string) => void
  onLigueChange: (value: string) => void
  onStatutChange: (value: string) => void
}) {
  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Recherche et filtres */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full md:w-auto">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une entente..."
                className="pl-9 bg-background border-input"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>

            <Select value={ligue} onValueChange={onLigueChange}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background border-input">
                <SelectValue placeholder="Ligue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les ligues</SelectItem>
                {ligues.map((ligueNom) => (
                  <SelectItem key={ligueNom} value={ligueNom}>
                    {ligueNom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statut} onValueChange={onStatutChange}>
              <SelectTrigger className="w-full sm:w-[140px] bg-background border-input">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
