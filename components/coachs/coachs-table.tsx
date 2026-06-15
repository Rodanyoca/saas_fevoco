"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import type { Coach } from "@/lib/types"

interface CoachsTableProps {
  coachs: Coach[]
  onViewCoach: (coach: Coach) => void
}

export function CoachsTable({ coachs, onViewCoach }: CoachsTableProps) {
  const formatCoachId = (id: string) => {
    const numeric = id.replace(/\D/g, "")
    return numeric.padStart(9, "0")
  }

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "actif":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>
      case "inactif":
        return <Badge variant="secondary">Inactif</Badge>
      default:
        return <Badge variant="outline">{statut}</Badge>
    }
  }

  const getCertificationBadge = (niveau: string) => {
    switch (niveau) {
      case "National":
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/10">National</Badge>
      case "Provincial":
        return <Badge className="bg-accent/10 text-accent-foreground hover:bg-accent/10">Provincial</Badge>
      case "Local":
        return <Badge variant="outline">Local</Badge>
      default:
        return <Badge variant="outline">{niveau}</Badge>
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
        <CardTitle>Liste des Coachs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">ID</TableHead>
              <TableHead>Coach</TableHead>
              <TableHead>Profil</TableHead>
              <TableHead>Club</TableHead>
              <TableHead>Certification</TableHead>
              <TableHead>Spécialisation</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coachs.map((coach) => (
              <TableRow key={coach.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-mono text-muted-foreground">{formatCoachId(coach.id)}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <p className="font-medium">{coach.nomComplet}</p>
                    <p className="text-sm text-muted-foreground">{coach.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span>{coach.genre === "F" ? "F" : "M"}</span>
                    <span className="text-sm text-muted-foreground">
                      {calculateAge(coach.dateNaissance)} ans
                    </span>
                  </div>
                </TableCell>
                <TableCell>{coach.clubNom}</TableCell>
                <TableCell>{getCertificationBadge(coach.niveau)}</TableCell>
                <TableCell>{coach.specialisation}</TableCell>
                <TableCell>{getStatutBadge(coach.statut)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => onViewCoach(coach)}>
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
