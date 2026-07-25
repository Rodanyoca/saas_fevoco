"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EditEntenteDialog } from "@/components/ententes/entente-form-dialog"
import type { SavedEntente } from "@/components/ententes/entente-form-dialog"
import type { Entente, Ligue } from "@/lib/types"
import { Network } from "lucide-react"

export function EntentesTable({ ententes, ligues, totalCount, onSaved }: {
  ententes: Entente[]
  ligues: Ligue[]
  totalCount: number
  onSaved: (entente: SavedEntente) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Network className="h-5 w-5 text-primary" />
            Liste des Ententes
          </CardTitle>
          <Badge variant="outline">{totalCount} ententes</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Entente</TableHead>
                <TableHead>Ligue</TableHead>
                <TableHead>Adresse e-mail</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-12 text-right"><span className="sr-only">Action</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ententes.map((entente) => (
                <TableRow key={entente.idEntente}>
                  <TableCell className="font-mono text-muted-foreground">{entente.idEntente || "Non renseigné"}</TableCell>
                  <TableCell>
                    <p className="font-medium">{entente.nomEntente || "Non renseignée"}</p>
                    <p className="text-xs text-muted-foreground">{entente.pseudoEntente || "Non renseigné"}</p>
                  </TableCell>
                  <TableCell>{entente.nomLigue || "Non renseignée"}</TableCell>
                  <TableCell>{entente.emailEntente || "Non renseignée"}</TableCell>
                  <TableCell>
                    <Badge variant={entente.statut === "active" ? "default" : "secondary"}>{entente.statut || "Non renseigné"}</Badge>
                  </TableCell>
                  <TableCell className="text-right"><EditEntenteDialog entente={entente} ligues={ligues} onSaved={onSaved} /></TableCell>
                </TableRow>
              ))}
              {ententes.length === 0 && (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">Aucune donnée disponible.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
