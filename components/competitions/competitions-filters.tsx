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

export function CompetitionsFilters({
  search,
  discipline,
  statut,
  statuts,
  onSearchChange,
  onDisciplineChange,
  onStatutChange,
}: {
  search: string
  discipline: string
  statut: string
  statuts: string[]
  onSearchChange: (value: string) => void
  onDisciplineChange: (value: string) => void
  onStatutChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une competition..."
            className="w-full pl-9 sm:w-72"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <Select value={discipline} onValueChange={onDisciplineChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Discipline" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="INDOOR">Indoor</SelectItem>
            <SelectItem value="BEACH">Beach</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statut} onValueChange={onStatutChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {statuts.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
