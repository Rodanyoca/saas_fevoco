"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { clubs, type Club } from "@/lib/data/demo-data"
import { Eye, Shield } from "lucide-react"

interface ClubsTableProps {
  onViewClub: (club: Club) => void
}

export function ClubsTable({ onViewClub }: ClubsTableProps) {
  const formatClubId = (id: string) => {
    const numeric = id.replace(/\D/g, "")
    return numeric.padStart(7, "0")
  }

  const getGenreBadgeColor = (genre: string) => {
    switch (genre) {
      case "Masculin":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "Féminin":
        return "bg-pink-100 text-pink-800 hover:bg-pink-100"
      case "Mixte":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Liste des Clubs
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {clubs.length} clubs
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">ID</TableHead>
                <TableHead>Nom du Club</TableHead>
                <TableHead>Entente</TableHead>
                <TableHead>Ligue</TableHead>
                <TableHead className="text-center">Athlètes</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clubs.map((club) => (
                <TableRow key={club.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono text-muted-foreground">
                    {formatClubId(club.id)}
                  </TableCell>
                  <TableCell 
                    className="font-medium"
                    onClick={() => onViewClub(club)}
                  >
                    <div className="flex flex-col gap-1">
                      <span>{club.nom}</span>
                      <span>
                        <Badge variant="secondary" className={getGenreBadgeColor(club.genre)}>
                          {club.genre}
                        </Badge>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {club.entente}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {club.ligue}
                  </TableCell>
                  <TableCell className="text-center">{club.athletes}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={club.statut === "actif" ? "default" : "secondary"}
                      className={
                        club.statut === "actif"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                      }
                    >
                      {club.statut === "actif" ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onViewClub(club)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Voir détails</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
