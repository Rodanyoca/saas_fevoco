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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { clubs, type Club } from "@/lib/data/demo-data"
import { MoreHorizontal, Eye, Pencil, Trash2, Shield } from "lucide-react"

interface ClubsTableProps {
  onViewClub: (club: Club) => void
}

export function ClubsTable({ onViewClub }: ClubsTableProps) {
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
                <TableHead>Nom du Club</TableHead>
                <TableHead>Genre</TableHead>
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
                  <TableCell 
                    className="font-medium"
                    onClick={() => onViewClub(club)}
                  >
                    {club.nom}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getGenreBadgeColor(club.genre)}>
                      {club.genre}
                    </Badge>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewClub(club)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
