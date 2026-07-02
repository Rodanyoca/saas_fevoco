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
import { calculateAgeFromSheetDate, formatSheetDate } from "@/lib/date-utils"
import type { Coach } from "@/lib/types"
import { Eye } from "lucide-react"

interface CoachsTableProps {
  coachs: Coach[]
  onViewCoach: (coach: Coach) => void
}

function getInitials(nomComplet: string) {
  const parts = nomComplet.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "C"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase()
}

function getGenreLabel(genre: string) {
  if (genre === "M") return "Masculin"
  if (genre === "F") return "Féminin"
  return genre || "-"
}

function getStatutBadge(statut: string) {
  switch (statut) {
    case "actif":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>
    case "inactif":
      return <Badge variant="secondary">Inactif</Badge>
    default:
      return <Badge variant="outline">{statut || "-"}</Badge>
  }
}

function getNiveauBadge(niveau: string) {
  switch (niveau) {
    case "National":
      return <Badge className="bg-primary/10 text-primary hover:bg-primary/10">National</Badge>
    case "Provincial":
      return <Badge className="bg-accent/10 text-accent-foreground hover:bg-accent/10">Provincial</Badge>
    case "Local":
      return <Badge variant="outline">Local</Badge>
    default:
      return <Badge variant="outline">{niveau || "-"}</Badge>
  }
}

export function CoachsTable({ coachs, onViewCoach }: CoachsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Liste des Coachs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matricule</TableHead>
                <TableHead>Coach</TableHead>
                <TableHead>Sexe / Âge</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Spécialisation</TableHead>
                <TableHead>Affiliation</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coachs.map((coach, index) => {
                const age = calculateAgeFromSheetDate(coach.dateNaissance)

                return (
                  <TableRow key={`${coach.id || "coach"}-${coach.nomComplet || "sans-nom"}-${index}`}>
                    <TableCell className="font-mono text-muted-foreground">
                      {coach.id || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(coach.nomComplet)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium leading-tight">{coach.nomComplet || "-"}</p>
                          <p className="text-xs text-muted-foreground">{coach.nationalite || "-"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{getGenreLabel(coach.genre)}</span>
                        <span className="text-xs text-muted-foreground">
                          {age !== null ? `${age} ans` : "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex max-w-[220px] flex-col">
                        <span className="truncate font-medium">{coach.telephone || "-"}</span>
                        <span className="truncate text-xs text-muted-foreground">{coach.email || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getNiveauBadge(coach.niveau)}
                    </TableCell>
                    <TableCell>
                      <span className="block max-w-[180px] truncate">{coach.specialisation || "-"}</span>
                    </TableCell>
                    <TableCell>{formatSheetDate(coach.dateAffiliation)}</TableCell>
                    <TableCell>{getStatutBadge(coach.statut)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => onViewCoach(coach)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Voir détails</span>
                      </Button>
                    </TableCell>
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
