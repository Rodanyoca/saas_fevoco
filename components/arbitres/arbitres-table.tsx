"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye } from "lucide-react"
import type { Arbitre } from "@/lib/types"

interface ArbitresTableProps {
  arbitres: Arbitre[]
  onViewArbitre: (arbitre: Arbitre) => void
}

export function ArbitresTable({ arbitres, onViewArbitre }: ArbitresTableProps) {
  const formatArbitreId = (id: string) => {
    const numeric = id.replace(/\D/g, "")
    return numeric.padStart(9, "0")
  }

  const getStatutBadge = (statut: Arbitre["statut"]) => {
    switch (statut) {
      case "actif":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Actif</Badge>
      case "inactif":
        return <Badge variant="secondary">Inactif</Badge>
      default:
        return <Badge variant="outline">{statut}</Badge>
    }
  }

  const getGradeBadge = (grade: Arbitre["grade"]) => {
    return <Badge variant="outline">{grade}</Badge>
  }

  const yearsOfExperience = (dateHomologation: string) => {
    if (!dateHomologation) return 0
    const gradeDate = new Date(dateHomologation)
    const today = new Date()
    return today.getFullYear() - gradeDate.getFullYear()
  }

  const calculateAge = (dateNaissance: string) => {
    const today = new Date()
    const birthDate = new Date(dateNaissance)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Liste des Arbitres</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[120px]">ID</TableHead>
              <TableHead>Arbitre</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Ligue</TableHead>
              <TableHead className="text-center">Exp.</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {arbitres.map((arbitre) => (
              <TableRow key={arbitre.id} className="hover:bg-muted/50">
                <TableCell className="font-mono text-muted-foreground">{formatArbitreId(arbitre.id)}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">
                      {arbitre.nomComplet}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {calculateAge(arbitre.dateNaissance)} ans - {arbitre.genre === "M" ? "Homme" : "Femme"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{getGradeBadge(arbitre.grade)}</TableCell>
                <TableCell className="text-muted-foreground">{arbitre.ligueNom}</TableCell>
                <TableCell className="text-center font-medium">{arbitre.experience || yearsOfExperience(arbitre.dateHomologation)}</TableCell>
                <TableCell>{getStatutBadge(arbitre.statut)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onViewArbitre(arbitre)}
                  >
                    <Eye className="h-4 w-4" />
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
