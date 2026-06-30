"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Entente } from "@/lib/types"
import { Network, Phone, User } from "lucide-react"

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
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
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
                <TableHead>Entente</TableHead>
                <TableHead>Ligue</TableHead>
                <TableHead>Personne contact</TableHead>
                <TableHead className="text-center">Clubs</TableHead>
                <TableHead className="text-center">Athlètes</TableHead>
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
                      <span className="text-xs leading-tight text-muted-foreground">
                        {entente.pseudo || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {entente.ligueNom || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1 text-sm">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {entente.personneContactNom || "-"}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {entente.personneContactTelephone || "-"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{entente.clubs ?? 0}</TableCell>
                  <TableCell className="text-center">{entente.athletes ?? 0}</TableCell>
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
