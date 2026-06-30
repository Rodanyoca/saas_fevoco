"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import type { Medecin } from "@/lib/types"

interface MedecinsFiltersProps {
  medecins: Medecin[]
  search: string
  ligue: string
  club: string
  statut: string
  onSearchChange: (value: string) => void
  onLigueChange: (value: string) => void
  onClubChange: (value: string) => void
  onStatutChange: (value: string) => void
}

export function MedecinsFilters({
  medecins,
  search,
  ligue,
  club,
  statut,
  onSearchChange,
  onLigueChange,
  onClubChange,
  onStatutChange,
}: MedecinsFiltersProps) {
  const ligueOptions = Array.from(
    new Set(medecins.map((medecin) => medecin.ligueNom).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))

  const clubOptions = Array.from(
    new Set(medecins.map((medecin) => medecin.clubNom).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_132px]">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Rechercher un médecin..."
              className="pl-9"
            />
          </div>

          <Select value={ligue} onValueChange={onLigueChange}>
            <SelectTrigger>
              <SelectValue placeholder="Ligue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les ligues</SelectItem>
              {ligueOptions.map((ligueNom) => (
                <SelectItem key={ligueNom} value={ligueNom}>
                  {ligueNom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={club} onValueChange={onClubChange}>
            <SelectTrigger>
              <SelectValue placeholder="Club" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les clubs</SelectItem>
              {clubOptions.map((clubNom) => (
                <SelectItem key={clubNom} value={clubNom}>
                  {clubNom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statut} onValueChange={onStatutChange}>
            <SelectTrigger>
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
