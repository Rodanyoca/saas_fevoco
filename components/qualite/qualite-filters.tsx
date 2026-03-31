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

export function QualiteFilters() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-10"
          />
        </div>
        
        <Select defaultValue="all">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type d'entité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes entités</SelectItem>
            <SelectItem value="athlete">Athlètes</SelectItem>
            <SelectItem value="ligue">Ligues</SelectItem>
            <SelectItem value="entente">Ententes</SelectItem>
            <SelectItem value="club">Clubs</SelectItem>
            <SelectItem value="coach">Coachs</SelectItem>
            <SelectItem value="arbitre">Arbitres</SelectItem>
            <SelectItem value="medecin">Médecins</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Province" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes provinces</SelectItem>
            {provinces.map((province) => (
              <SelectItem key={province.id} value={province.id}>
                {province.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
