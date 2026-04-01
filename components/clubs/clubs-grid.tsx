"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, MapPin, Eye, Shield } from "lucide-react"
import type { Club } from "@/lib/types"

interface ClubsGridProps {
  clubs: Club[]
  onViewClub: (club: Club) => void
}

export function ClubsGrid({ clubs, onViewClub }: ClubsGridProps) {
  const getGenreBadgeColor = (genre: string) => {
    switch (genre) {
      case "Masculin":
        return "bg-blue-100 text-blue-800"
      case "Féminin":
        return "bg-pink-100 text-pink-800"
      case "Mixte":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {clubs.map((club) => (
        <Card 
          key={club.id} 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onViewClub(club)}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{club.nom}</h3>
                  <p className="text-sm text-muted-foreground">{club.version}</p>
                </div>
              </div>
              <Badge
                variant={club.statut === "actif" ? "default" : "secondary"}
                className={
                  club.statut === "actif"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }
              >
                {club.statut === "actif" ? "Actif" : "Inactif"}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{club.provinceNom}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{club.athletes ?? "—"} athlètes</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <Badge variant="secondary" className={getGenreBadgeColor(club.genre ?? "")}>
                {club.genre ?? "—"}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => onViewClub(club)}>
                <Eye className="h-4 w-4 mr-1" />
                Détails
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
