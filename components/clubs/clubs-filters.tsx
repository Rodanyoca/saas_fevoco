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
import type { Club } from "@/lib/types"
import { Search } from "lucide-react"

export function ClubsFilters({
  clubs,
  search,
  ligue,
  statut,
  onSearchChange,
  onLigueChange,
  onStatutChange,
}: {
  clubs: Club[]
  search: string
  ligue: string
  statut: string
  onSearchChange: (value: string) => void
  onLigueChange: (value: string) => void
  onStatutChange: (value: string) => void
}) {
  const liguesOptions = Array.from(new Set(clubs.map((club) => club.ligueNom).filter(Boolean)))

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un club..."
              className="pl-9"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <Select value={ligue} onValueChange={onLigueChange}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Ligue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les ligues</SelectItem>
              {liguesOptions.map((ligueNom) => (
                <SelectItem key={ligueNom} value={ligueNom}>
                  {ligueNom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statut} onValueChange={onStatutChange}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="inactif">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
