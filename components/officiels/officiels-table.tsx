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
import type { Officiel } from "@/lib/types"

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
        return <Badge variant="outline">{statut || "Non défini"}</Badge>
    }
  }

  const getFederalEntity = (officiel: Officiel) => {
    if (officiel.clubId || officiel.clubNom) {
      return { type: "Club", name: officiel.clubNom || officiel.clubId }
    }

    if (officiel.ententeId || officiel.ententeNom) {
      return { type: "Entente", name: officiel.ententeNom || officiel.ententeId }
    }

    if (officiel.ligueId || officiel.ligueNom) {
      return { type: "Ligue", name: officiel.ligueNom || officiel.ligueId }
    }

    if (officiel.equipeFederal) {
      return { type: "Entité", name: officiel.equipeFederal }
    }

    return { type: "Entité", name: officiel.provinceNom || "-" }
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
              <TableHead>Nom</TableHead>
              <TableHead className="w-[22%]">Fonction</TableHead>
              <TableHead className="w-[30%]">Entité fédérale</TableHead>
              <TableHead className="w-[92px]">Statut</TableHead>
              <TableHead className="w-[44px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {officiels.map((officiel) => {
              const entity = getFederalEntity(officiel)

              return (
                <TableRow key={officiel.id} className="hover:bg-muted/50">
                  <TableCell>
                    <p className="truncate font-medium text-foreground">{officiel.nomComplet || "-"}</p>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{officiel.fonction || "-"}</p>
                      <p className="truncate text-xs text-muted-foreground">{officiel.niveau || "Niveau non défini"}</p>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <div className="min-w-0">
                      <p className="whitespace-normal break-words font-medium leading-snug text-foreground [overflow-wrap:anywhere]">
                        {entity.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{entity.type}</p>
                    </div>
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
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
