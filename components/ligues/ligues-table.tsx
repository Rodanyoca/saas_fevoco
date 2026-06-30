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
  const formatLigueId = (id: string) => {
    const numeric = id.replace(/\D/g, "")
    return numeric.padStart(2, "0")
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Building2 className="h-5 w-5 text-primary" />
            Liste des Ligues
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {totalCount} ligues
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Nom de la Ligue</TableHead>
                <TableHead>Province</TableHead>
                <TableHead className="text-center">Ententes</TableHead>
                <TableHead className="text-center">Clubs</TableHead>
                <TableHead className="text-center">Athlètes</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ligues.map((ligue) => (
                <TableRow key={ligue.id}>
                  <TableCell className="font-mono text-muted-foreground">
                    {formatLigueId(ligue.id)}
                  </TableCell>
                  <TableCell className="font-medium">{ligue.nom}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {ligue.provinceNom}
                  </TableCell>
                  <TableCell className="text-center">{ligue.ententes ?? "-"}</TableCell>
                  <TableCell className="text-center">{ligue.clubs ?? "-"}</TableCell>
                  <TableCell className="text-center">{ligue.athletes ?? "-"}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={ligue.statut === "active" ? "default" : "secondary"}
                      className={
                        ligue.statut === "active"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                      }
                    >
                      {ligue.statut === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewLigue(ligue)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Voir les détails</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
