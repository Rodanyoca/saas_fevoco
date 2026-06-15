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
import type { Officiel } from "@/lib/types"

export function OfficielsFilters({ officiels }: { officiels: Officiel[] }) {
  const provinceOptions = Array.from(
    new Set(officiels.map((o) => o.provinceNom).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))

  const fonctionOptions = Array.from(
    new Set(officiels.map((o) => o.fonction).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher un officiel..." className="pl-9" />
        </div>

        <Select>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Province" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les provinces</SelectItem>
            {provinceOptions.map((provinceNom) => (
              <SelectItem key={provinceNom} value={provinceNom}>
                {provinceNom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Poste" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les postes</SelectItem>
            {fonctionOptions.map((fonction) => (
              <SelectItem key={fonction} value={fonction}>
                {fonction}
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
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
