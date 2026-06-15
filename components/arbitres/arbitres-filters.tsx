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
import type { Arbitre } from "@/lib/types"

export function ArbitresFilters({ arbitres }: { arbitres: Arbitre[] }) {
  const ligueOptions = Array.from(
    new Set(arbitres.map((a) => a.ligueNom).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))

  const gradeOptions = Array.from(
    new Set(arbitres.map((a) => a.grade).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un arbitre..."
            className="pl-9"
          />
        </div>
        
        <Select>
          <SelectTrigger className="w-full sm:w-[180px]">
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
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les grades</SelectItem>
            {gradeOptions.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-full sm:w-[140px]">
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
    </div>
  )
}
