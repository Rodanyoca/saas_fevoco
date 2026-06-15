"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"
import type { Medecin } from "@/lib/types"

export function MedecinsFilters({ medecins }: { medecins: Medecin[] }) {
  const ligueOptions = Array.from(
    new Set(medecins.map((m) => m.ligueNom).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))

  const clubOptions = Array.from(
    new Set(medecins.map((m) => m.clubNom).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un médecin..."
            className="pl-9 bg-background border-border"
          />
        </div>
        
        <Select>
          <SelectTrigger className="w-full sm:w-[180px] bg-background border-border">
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

        <Select>
          <SelectTrigger className="w-full sm:w-[180px] bg-background border-border">
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

        <Select>
          <SelectTrigger className="w-full sm:w-[140px] bg-background border-border">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="actif">Actif</SelectItem>
            <SelectItem value="inactif">Inactif</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
