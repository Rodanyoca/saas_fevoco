"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Plus, Download, Filter } from "lucide-react"
import { ligues } from "@/lib/data/demo-data"

export function EntentesFilters() {
  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Recherche et filtres */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full md:w-auto">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une entente..."
                className="pl-9 bg-background border-input"
              />
            </div>

            <Select>
              <SelectTrigger className="w-full sm:w-[180px] bg-background border-input">
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
              <SelectTrigger className="w-full sm:w-[140px] bg-background border-input">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" className="hidden sm:flex">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exporter</span>
            </Button>
            <Button className="flex-1 md:flex-none gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nouvelle Entente</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
