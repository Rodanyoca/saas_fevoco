"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Network, Phone, User } from "lucide-react"
import type { Entente } from "@/lib/types"

export function EntentesTable({
  ententes,
  totalCount,
}: {
  ententes: Entente[]
  totalCount: number
}) {
  const formatEntenteId = (id: string) => {
    const numeric = id.replace(/\D/g, "")
    return numeric.padStart(4, "0")
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Liste des Ententes
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {totalCount} ententes
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[90px]">ID</TableHead>
                <TableHead>Nom de l&apos;Entente</TableHead>
                <TableHead>Province</TableHead>
                <TableHead className="text-center">Clubs</TableHead>
                <TableHead className="text-center">Athlètes</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead className="text-center">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ententes.map((entente) => (
                <TableRow key={entente.id}>
                  <TableCell className="font-mono text-muted-foreground">
                    {formatEntenteId(entente.id)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 leading-none">
                      <span className="font-medium leading-tight">{entente.nom}</span>
                      <span className="text-xs text-muted-foreground leading-tight">
                        {entente.pseudo}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {entente.provinceNom}
                  </TableCell>
                  <TableCell className="text-center">{entente.clubs ?? "—"}</TableCell>
                  <TableCell className="text-center">{entente.athletes ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {entente.presidentNom}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {entente.presidentTelephone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={entente.statut === "active" ? "default" : "secondary"}
                      className={
                        entente.statut === "active"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                      }
                    >
                      {entente.statut === "active" ? "Active" : "Inactive"}
                    </Badge>
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
