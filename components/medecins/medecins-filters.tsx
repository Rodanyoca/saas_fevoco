"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Download, Plus } from "lucide-react"
import { ligues } from "@/lib/data/demo-data"

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
            <SelectValue placeholder="Spécialité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes spécialités</SelectItem>
            <SelectItem value="sport">Médecine du sport</SelectItem>
            <SelectItem value="trauma">Traumatologie</SelectItem>
            <SelectItem value="kine">Kinésithérapie</SelectItem>
            <SelectItem value="general">Médecine générale</SelectItem>
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

      <div className="flex gap-2 w-full sm:w-auto">
        <Button variant="outline" className="flex-1 sm:flex-none border-border">
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
        <Button className="flex-1 sm:flex-none bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Médecin
        </Button>
      </div>
    </div>
  )
}
