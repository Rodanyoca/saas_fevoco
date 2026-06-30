"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { calculateAgeFromSheetDate } from "@/lib/date-utils"
import type { Athlete } from "@/lib/types"
import { Award, Eye, User } from "lucide-react"

interface AthletesTableProps {
  athletes: Athlete[]
  title?: string
  onViewAthlete?: (athlete: Athlete) => void
}

function formatAthleteId(id: string) {
  const numeric = id.replace(/\D/g, "")
  return numeric ? numeric.padStart(10, "0") : id || "-"
}

function getInitials(nomComplet: string) {
  const parts = nomComplet.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "A"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase()
}

function getStatusBadge(statut: string) {
  switch (statut) {
    case "actif":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Actif</Badge>
    case "inactif":
      return <Badge variant="secondary">Inactif</Badge>
    case "blesse":
      return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Blessé</Badge>
    default:
      return <Badge variant="outline">{statut || "-"}</Badge>
  }
}

function getGenreLabel(genre: string) {
  if (genre === "M") return "Masculin"
  if (genre === "F") return "Féminin"
  return genre || "-"
}

function getPostesLabel(athlete: Athlete) {
  const postes = [
    athlete.posteIndoor ? `Indoor: ${athlete.posteIndoor}` : "",
    athlete.posteBeach ? `Beach: ${athlete.posteBeach}` : "",
  ].filter(Boolean)

  return postes.length > 0 ? postes.join(" / ") : "-"
}

export function AthletesTable({
  athletes,
  title = "Liste des Athlètes",
  onViewAthlete,
}: AthletesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matricule</TableHead>
                <TableHead>Athlète</TableHead>
                <TableHead>Sexe / Âge</TableHead>
                <TableHead className="text-center">Équipe nationale</TableHead>
                <TableHead>Club / Discipline</TableHead>
                <TableHead>Statut</TableHead>
                {onViewAthlete && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {athletes.map((athlete) => {
                const age = calculateAgeFromSheetDate(athlete.dateNaissance)

                return (
                  <TableRow key={athlete.id}>
                    <TableCell className="font-mono text-muted-foreground">
                      {formatAthleteId(athlete.id)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(athlete.nomComplet)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium leading-tight">{athlete.nomComplet || "-"}</p>
                          <p className="text-xs text-muted-foreground">{athlete.numero || "-"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{getGenreLabel(athlete.genre)}</span>
                        <span className="text-xs text-muted-foreground">
                          {age !== null ? `${age} ans` : "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {athlete.selectionNationale === true ? (
                        <Badge className="bg-accent text-accent-foreground">
                          <Award className="mr-1 h-3 w-3" />
                          Oui
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <User className="mr-1 h-3 w-3" />
                          Non
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{athlete.clubNom || "-"}</span>
                        <span className="text-xs text-muted-foreground">{athlete.disciplineActive || "-"}</span>
                        <span className="text-xs text-muted-foreground">{getPostesLabel(athlete)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(athlete.statut)}</TableCell>
                    {onViewAthlete && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => onViewAthlete(athlete)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir détails</span>
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
