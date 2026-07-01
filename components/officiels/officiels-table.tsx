"use client"

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
import type { Officiel } from "@/lib/types"
import { Eye } from "lucide-react"

interface OfficielsTableProps {
  officiels: Officiel[]
  onViewOfficiel: (officiel: Officiel) => void
}

export function OfficielsTable({ officiels, onViewOfficiel }: OfficielsTableProps) {
  const getStatutBadge = (statut: Officiel["statut"]) => {
    switch (statut) {
      case "actif":
        return <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">Actif</Badge>
      case "inactif":
        return <Badge variant="secondary">Inactif</Badge>
      default:
        return <Badge variant="outline">{statut || "Non defini"}</Badge>
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Liste des officiels ({officiels.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[110px]">ID</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead className="w-[28%]">Fonction</TableHead>
              <TableHead className="w-[26%]">Equipe federale</TableHead>
              <TableHead className="w-[92px]">Statut</TableHead>
              <TableHead className="w-[44px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {officiels.map((officiel, index) => (
              <TableRow
                key={`${officiel.id || "officiel"}-${officiel.nomComplet || "sans-nom"}-${index}`}
                className="hover:bg-muted/50"
              >
                <TableCell className="font-mono text-muted-foreground">
                  {officiel.id || "-"}
                </TableCell>
                <TableCell>
                  <p className="truncate font-medium text-foreground">{officiel.nomComplet || "-"}</p>
                </TableCell>
                <TableCell>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{officiel.fonction || "-"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {officiel.entite || "Entite non definie"}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="whitespace-normal">
                  <p className="whitespace-normal break-words font-medium leading-snug text-foreground [overflow-wrap:anywhere]">
                    {officiel.equipeFederal || "-"}
                  </p>
                </TableCell>
                <TableCell>{getStatutBadge(officiel.statut)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onViewOfficiel(officiel)}
                    aria-label={`Voir ${officiel.nomComplet}`}
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
