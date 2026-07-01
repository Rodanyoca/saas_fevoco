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
import type { Officiel } from "@/lib/types"

interface OfficielsFiltersProps {
  officiels: Officiel[]
  search: string
  entite: string
  fonction: string
  statut: string
  onSearchChange: (value: string) => void
  onEntiteChange: (value: string) => void
  onFonctionChange: (value: string) => void
  onStatutChange: (value: string) => void
}

export function OfficielsFilters({
  officiels,
  search,
  entite,
  fonction,
  statut,
  onSearchChange,
  onEntiteChange,
  onFonctionChange,
  onStatutChange,
}: OfficielsFiltersProps) {
  const entiteOptions = Array.from(
    new Set(officiels.map((officiel) => officiel.entite).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))

  const fonctionOptions = Array.from(
    new Set(officiels.map((officiel) => officiel.fonction).filter(Boolean))
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
              placeholder="Rechercher un officiel..."
              className="pl-9"
            />
          </div>

          <Select value={entite} onValueChange={onEntiteChange}>
            <SelectTrigger>
              <SelectValue placeholder="Entite" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les entites</SelectItem>
              {entiteOptions.map((entiteNom) => (
                <SelectItem key={entiteNom} value={entiteNom}>
                  {entiteNom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={fonction} onValueChange={onFonctionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Fonction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les fonctions</SelectItem>
              {fonctionOptions.map((fonctionNom) => (
                <SelectItem key={fonctionNom} value={fonctionNom}>
                  {fonctionNom}
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
