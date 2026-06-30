"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { QualityStat } from "@/lib/quality"
import { Search } from "lucide-react"

interface QualiteFiltersProps {
  stats: QualityStat[]
  search: string
  entity: string
  onSearchChange: (value: string) => void
  onEntityChange: (value: string) => void
}

export function QualiteFilters({
  stats,
  search,
  entity,
  onSearchChange,
  onEntityChange,
}: QualiteFiltersProps) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_260px]">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Rechercher une entite..."
              className="pl-9"
            />
          </div>

          <Select value={entity} onValueChange={onEntityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Type d'entite" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les entites</SelectItem>
              {stats.map((stat) => (
                <SelectItem key={stat.entite} value={stat.entite}>
                  {stat.entite}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
