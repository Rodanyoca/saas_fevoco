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
import type { Arbitre } from "@/lib/types"

interface ArbitresFiltersProps {
  arbitres: Arbitre[]
  search: string
  ligue: string
  grade: string
  statut: string
  onSearchChange: (value: string) => void
  onLigueChange: (value: string) => void
  onGradeChange: (value: string) => void
  onStatutChange: (value: string) => void
}

export function ArbitresFilters({
  arbitres,
  search,
  ligue,
  grade,
  statut,
  onSearchChange,
  onLigueChange,
  onGradeChange,
  onStatutChange,
}: ArbitresFiltersProps) {
  const ligueOptions = Array.from(
    new Set(arbitres.map((arbitre) => arbitre.ligueNom).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))

  const gradeOptions = Array.from(
    new Set(arbitres.map((arbitre) => arbitre.grade).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_160px_132px]">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Rechercher un arbitre..."
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

          <Select value={grade} onValueChange={onGradeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les grades</SelectItem>
              {gradeOptions.map((gradeNom) => (
                <SelectItem key={gradeNom} value={gradeNom}>
                  {gradeNom}
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
              <SelectItem value="suspendu">Suspendu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
