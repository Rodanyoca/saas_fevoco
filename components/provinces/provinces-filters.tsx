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

export function ProvincesFilters() {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border/50 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une province..."
            className="pl-10 bg-background"
          />
        </div>
        
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-40 bg-background">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-48 bg-background">
            <SelectValue placeholder="Complétude" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="high">Élevée (80%+)</SelectItem>
            <SelectItem value="medium">Moyenne (50-79%)</SelectItem>
            <SelectItem value="low">Faible (-50%)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
