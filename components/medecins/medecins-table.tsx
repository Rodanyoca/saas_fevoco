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
import { Eye, Phone } from "lucide-react"
import { medecins, type Medecin } from "@/lib/data/demo-data"

interface MedecinsTableProps {
  onViewMedecin: (medecin: Medecin) => void
}

export function MedecinsTable({ onViewMedecin }: MedecinsTableProps) {
  const formatMedecinId = (id: string) => {
    const numeric = id.replace(/\D/g, "")
    return numeric.padStart(8, "0")
  }

  const getStatutBadge = (statut: Medecin["statut"]) => {
    switch (statut) {
      case "actif":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>
      case "inactif":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactif</Badge>
      default:
        return <Badge variant="outline">{statut}</Badge>
    }
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
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">
          Liste des Médecins ({medecins.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-muted-foreground w-[110px]">ID</TableHead>
              <TableHead className="text-muted-foreground">Médecin</TableHead>
              <TableHead className="text-muted-foreground">Profil</TableHead>
              <TableHead className="text-muted-foreground">Ligue</TableHead>
              <TableHead className="text-muted-foreground text-center">Clubs suivis</TableHead>
              <TableHead className="text-muted-foreground">Statut</TableHead>
              <TableHead className="text-muted-foreground w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medecins.map((medecin) => (
              <TableRow 
                key={medecin.id} 
                className="border-border hover:bg-muted/50"
              >
                <TableCell className="font-mono text-muted-foreground">
                  {formatMedecinId(medecin.id)}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">
                      Dr. {medecin.prenom} {medecin.nom}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {medecin.telephone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">
                      {medecin.genre === "M" ? "Homme" : "Femme"}
                    </p>
                    <p className="text-xs text-muted-foreground">{calculateAge(medecin.dateNaissance)} ans</p>
                  </div>
                </TableCell>
                <TableCell className="text-foreground">{medecin.ligue}</TableCell>
                <TableCell className="text-center">
                  <span className="font-semibold text-foreground">{medecin.athletesSuivis}</span>
                </TableCell>
                <TableCell>{getStatutBadge(medecin.statut)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onViewMedecin(medecin)}
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
