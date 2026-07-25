"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import type { Ligue } from "@/lib/types"
import { Building2, Eye } from "lucide-react"

export function LiguesTable({
  ligues,
  totalCount,
  onViewLigue,
}: {
  ligues: Ligue[]
  totalCount: number
  onViewLigue: (ligue: Ligue) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Building2 className="h-5 w-5 text-primary" />
            Liste des Ligues
          </CardTitle>
          <Badge variant="outline">{totalCount} ligues</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Ligue</TableHead>
                <TableHead>Province</TableHead>
                <TableHead>Adresse e-mail</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ligues.map((ligue, index) => (
                <TableRow key={`${ligue.id}-${index}`}>
                  <TableCell className="font-mono">{ligue.id || "Non renseigné"}</TableCell>
                  <TableCell className="font-medium">{ligue.nom || "Non renseigné"}</TableCell>
                  <TableCell>{ligue.provinceNom || "Non renseignée"}</TableCell>
                  <TableCell>{ligue.emailLigue || "Non renseignée"}</TableCell>
                  <TableCell>
                    <Badge variant={ligue.statut === "active" ? "default" : "secondary"}>
                      {ligue.statut || "Non renseigné"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onViewLigue(ligue)}>
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Voir les détails</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {ligues.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Aucune donnée disponible.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
