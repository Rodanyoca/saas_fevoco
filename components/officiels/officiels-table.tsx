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
import { officiels, type Officiel } from "@/lib/data/demo-data"

interface OfficielsTableProps {
  onViewOfficiel: (officiel: Officiel) => void
}

export function OfficielsTable({ onViewOfficiel }: OfficielsTableProps) {
  const formatOfficielId = (id: string) => {
    const numeric = id.replace(/\D/g, "")
    return numeric.padStart(8, "0")
  }

  const getStatutBadge = (statut: Officiel["statut"]) => {
    switch (statut) {
      case "actif":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Actif</Badge>
      case "inactif":
        return <Badge variant="secondary">Inactif</Badge>
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Liste des Officiels</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[120px]">ID</TableHead>
              <TableHead>Officiel</TableHead>
              <TableHead>Poste</TableHead>
              <TableHead>Province</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {officiels.map((officiel) => (
              <TableRow key={officiel.id} className="hover:bg-muted/50">
                <TableCell className="font-mono text-muted-foreground">{formatOfficielId(officiel.id)}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">
                      {officiel.prenom} {officiel.nom}
                    </p>
                    <p className="text-xs text-muted-foreground">{officiel.email}</p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{officiel.poste}</TableCell>
                <TableCell className="text-muted-foreground">{officiel.province}</TableCell>
                <TableCell>{getStatutBadge(officiel.statut)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onViewOfficiel(officiel)}
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
