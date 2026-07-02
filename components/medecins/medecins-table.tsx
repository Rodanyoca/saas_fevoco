"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { calculateAgeFromSheetDate, formatSheetDate } from "@/lib/date-utils"
import type { Medecin } from "@/lib/types"
import { Eye, Mail, Phone } from "lucide-react"

interface MedecinsTableProps {
  medecins: Medecin[]
  onViewMedecin: (medecin: Medecin) => void
}

export function MedecinsTable({ medecins, onViewMedecin }: MedecinsTableProps) {
  const getInitials = (nomComplet: string) => {
    const parts = nomComplet.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return "M"
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase()
  }

  const getStatutBadge = (statut: Medecin["statut"]) => {
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
        <CardTitle className="text-lg font-semibold">Liste des medecins ({medecins.length})</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[110px]">ID</TableHead>
              <TableHead className="min-w-[240px]">Medecin</TableHead>
              <TableHead className="w-[190px]">Profil</TableHead>
              <TableHead className="w-[210px]">Contact</TableHead>
              <TableHead className="w-[140px]">Affiliation</TableHead>
              <TableHead className="w-[180px]">Equipe nationale</TableHead>
              <TableHead className="w-[96px]">Statut</TableHead>
              <TableHead className="w-[44px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medecins.map((medecin, index) => {
              const age = calculateAgeFromSheetDate(medecin.dateNaissance)

              return (
                <TableRow
                  key={`${medecin.id || "medecin"}-${medecin.nomComplet || "sans-nom"}-${index}`}
                  className="hover:bg-muted/50"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {medecin.id || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(medecin.nomComplet)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">Dr. {medecin.nomComplet}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {medecin.genre || "Genre non defini"}
                          {age !== null ? ` - ${age} ans` : ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {medecin.specialite || "Specialite non definie"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {medecin.niveau || "Niveau non defini"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0 space-y-1 text-xs text-muted-foreground">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{medecin.telephone || "-"}</span>
                      </div>
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{medecin.email || "-"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatSheetDate(medecin.dateAffiliation)}
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {medecin.equipeNationale || "-"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{medecin.numeroOrdre || "-"}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatutBadge(medecin.statut)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onViewMedecin(medecin)}
                      aria-label={`Voir ${medecin.nomComplet}`}
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
