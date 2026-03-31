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
import { provinces } from "@/lib/data/demo-data"

export function LiguesFilters() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une ligue..."
            className="pl-9 w-full sm:w-64"
          />
        </div>

        {/* Filtre par province */}
        <Select>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Toutes les provinces" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les provinces</SelectItem>
            {provinces.map((province) => (
              <SelectItem key={province.id} value={province.id}>
                {province.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtre par statut */}
        <Select>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actives</SelectItem>
            <SelectItem value="inactive">Inactives</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
