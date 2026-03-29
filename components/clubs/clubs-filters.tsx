"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Download, Plus, List, LayoutGrid } from "lucide-react"
import { ligues } from "@/lib/data/demo-data"

interface ClubsFiltersProps {
  viewMode: "list" | "grid"
  onViewModeChange: (mode: "list" | "grid") => void
}

export function ClubsFilters({ viewMode, onViewModeChange }: ClubsFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un club..."
                className="pl-9"
              />
            </div>
            
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
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
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="masculin">Masculin</SelectItem>
                <SelectItem value="feminin">Féminin</SelectItem>
                <SelectItem value="mixte">Mixte</SelectItem>
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

          <div className="flex gap-2 w-full lg:w-auto">
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => onViewModeChange("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => onViewModeChange("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Club
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
