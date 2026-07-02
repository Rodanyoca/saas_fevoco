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
  niveau: string
  specialite: string
  statut: string
  onSearchChange: (value: string) => void
  onNiveauChange: (value: string) => void
  onSpecialiteChange: (value: string) => void
  onStatutChange: (value: string) => void
}

export function MedecinsFilters({
  medecins,
  search,
  niveau,
  specialite,
  statut,
  onSearchChange,
  onNiveauChange,
  onSpecialiteChange,
  onStatutChange,
}: MedecinsFiltersProps) {
  const niveauOptions = Array.from(
    new Set(medecins.map((medecin) => medecin.niveau).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))

  const specialiteOptions = Array.from(
    new Set(medecins.map((medecin) => medecin.specialite).filter(Boolean))
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

          <Select value={niveau} onValueChange={onNiveauChange}>
            <SelectTrigger>
              <SelectValue placeholder="Niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              {niveauOptions.map((niveauNom) => (
                <SelectItem key={niveauNom} value={niveauNom}>
                  {niveauNom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={specialite} onValueChange={onSpecialiteChange}>
            <SelectTrigger>
              <SelectValue placeholder="Specialite" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les specialites</SelectItem>
              {specialiteOptions.map((specialiteNom) => (
                <SelectItem key={specialiteNom} value={specialiteNom}>
                  {specialiteNom}
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
