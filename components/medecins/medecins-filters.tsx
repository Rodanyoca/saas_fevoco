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
import { clubs, ligues } from "@/lib/data/demo-data"

export function MedecinsFilters() {
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
            {ligues.map((ligue) => (
              <SelectItem key={ligue.id} value={ligue.id}>
                {ligue.nom}
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
            {clubs.map((club) => (
              <SelectItem key={club.id} value={club.id}>
                {club.nom}
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
