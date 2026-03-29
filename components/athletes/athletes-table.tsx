"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2, Award } from "lucide-react"
import { athletes, type Athlete } from "@/lib/data/demo-data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface AthletesTableProps {
  onViewAthlete: (athlete: Athlete) => void
}

export function AthletesTable({ onViewAthlete }: AthletesTableProps) {
  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "actif":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Actif</Badge>
      case "inactif":
        return <Badge variant="secondary">Inactif</Badge>
      case "blesse":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Blessé</Badge>
      default:
        return <Badge variant="outline">{statut}</Badge>
    }
  }

  const getGenreBadge = (genre: string) => {
    return genre === "M" ? (
      <Badge variant="outline" className="border-primary text-primary">M</Badge>
    ) : (
      <Badge variant="outline" className="border-pink-500 text-pink-500">F</Badge>
    )
  }

  const calculateAge = (dateNaissance: string) => {
    const today = new Date()
    const birthDate = new Date(dateNaissance)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des Athlètes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Athlète</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Poste</TableHead>
              <TableHead>Club</TableHead>
              <TableHead>Ligue</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Sélection</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {athletes.map((athlete) => (
              <TableRow key={athlete.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {athlete.prenom[0]}{athlete.nom[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{athlete.prenom} {athlete.nom}</div>
                      <div className="text-xs text-muted-foreground">{athlete.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getGenreBadge(athlete.genre)}</TableCell>
                <TableCell>{calculateAge(athlete.dateNaissance)} ans</TableCell>
                <TableCell>{athlete.poste}</TableCell>
                <TableCell>{athlete.club}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{athlete.ligue}</TableCell>
                <TableCell>{getStatusBadge(athlete.statut)}</TableCell>
                <TableCell>
                  {athlete.selectionNationale && (
                    <Award className="h-4 w-4 text-accent" />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewAthlete(athlete)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
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
      </CardContent>
    </Card>
  )
}
