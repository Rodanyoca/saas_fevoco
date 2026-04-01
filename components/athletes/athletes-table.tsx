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
import { Eye, Award } from "lucide-react"
import type { Athlete } from "@/lib/types"

interface AthletesTableProps {
  athletes: Athlete[]
  onViewAthlete: (athlete: Athlete) => void
}

export function AthletesTable({ athletes, onViewAthlete }: AthletesTableProps) {
  const formatAthleteId = (id: string) => {
    const numeric = id.replace(/\D/g, "")
    return numeric.padStart(10, "0")
  }

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

  const getPrenomNom = (nomComplet: string) => {
    const parts = nomComplet.trim().split(/\s+/).filter(Boolean)
    if (parts.length <= 1) return { prenom: nomComplet.trim(), nom: "" }
    return {
      prenom: parts.slice(0, -1).join(" "),
      nom: parts[parts.length - 1],
    }
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
              <TableHead className="w-[120px]">ID</TableHead>
              <TableHead>Athlète</TableHead>
              <TableHead>Profil</TableHead>
              <TableHead>Affiliation</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {athletes.map((athlete) => (
              <TableRow key={athlete.id}>
                <TableCell className="font-mono text-muted-foreground">
                  {formatAthleteId(athlete.id)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">
                      {(() => {
                        const n = getPrenomNom(athlete.nomComplet)
                        return `${n.prenom}${n.nom ? " " + n.nom : ""}`
                      })()}
                    </span>
                    <span className="flex items-center gap-2">
                      {getGenreBadge(athlete.genre)}
                      {athlete.selectionNationale === true && <Award className="h-4 w-4 text-accent" />}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span>{calculateAge(athlete.dateNaissance)} ans</span>
                    <span className="text-sm text-muted-foreground">{athlete.poste}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span>{athlete.clubNom}</span>
                    <span className="text-sm text-muted-foreground">
                      {athlete.ententeNom}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(athlete.statut)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => onViewAthlete(athlete)}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Voir détails</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
