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
import type { Club } from "@/lib/types"
import { Eye, Shield } from "lucide-react"

interface ClubsTableProps {
  clubs: Club[]
  onViewClub: (club: Club) => void
}

export function ClubsTable({ clubs, onViewClub }: ClubsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Shield className="h-5 w-5 text-primary" />
            Liste des Clubs
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {clubs.length} clubs
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">ID</TableHead>
                <TableHead className="min-w-[220px]">Club</TableHead>
                <TableHead className="w-[140px]">Categorie</TableHead>
                <TableHead className="min-w-[220px]">Ligue / Entente</TableHead>
                <TableHead className="w-[110px]">Version</TableHead>
                <TableHead className="w-[90px] text-center">Athlètes</TableHead>
                <TableHead className="w-[110px] text-center">Statut</TableHead>
                <TableHead className="w-[80px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clubs.map((club, index) => (
                <TableRow key={`${club.id || "club"}-${club.nom || "sans-nom"}-${index}`} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-muted-foreground">
                    {club.id || "-"}
                  </TableCell>
                  <TableCell className="font-medium">{club.nom}</TableCell>
                  <TableCell>{club.categorie || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 leading-tight">
                      <span className="font-medium">{club.ligueNom || "-"}</span>
                      <span className="text-sm text-muted-foreground">{club.pseudoEntente || "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell>{club.version || "-"}</TableCell>
                  <TableCell className="text-center">{club.athletes ?? 0}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={club.statut === "actif" ? "default" : "secondary"}
                      className={
                        club.statut === "actif"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-100"
                      }
                    >
                      {club.statut === "actif" ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onViewClub(club)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Voir détails</span>
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
