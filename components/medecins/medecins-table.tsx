"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Mail, Phone } from "lucide-react"
import type { Medecin } from "@/lib/types"
import { calculateAgeFromSheetDate } from "@/lib/date-utils"

interface MedecinsTableProps {
  medecins: Medecin[]
  onViewMedecin: (medecin: Medecin) => void
}

export function MedecinsTable({ medecins, onViewMedecin }: MedecinsTableProps) {
  const formatMedecinId = (id: string) => {
    const numeric = id.replace(/\D/g, "")
    return numeric ? numeric.padStart(7, "0") : id
  }

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
        return <Badge variant="outline">{statut || "Non défini"}</Badge>
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">
          Liste des médecins ({medecins.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="hidden w-[84px] lg:table-cell">ID</TableHead>
              <TableHead>Médecin</TableHead>
              <TableHead className="hidden w-[18%] md:table-cell">Profil</TableHead>
              <TableHead className="hidden w-[18%] lg:table-cell">Contact</TableHead>
              <TableHead className="w-[26%] md:w-[22%]">Affiliation active</TableHead>
              <TableHead className="w-[84px]">Statut</TableHead>
              <TableHead className="w-[44px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medecins.map((medecin) => {
              const age = calculateAgeFromSheetDate(medecin.dateNaissance)

              return (
                <TableRow key={medecin.id} className="hover:bg-muted/50">
                  <TableCell className="hidden font-mono text-xs text-muted-foreground lg:table-cell">
                    {formatMedecinId(medecin.id)}
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
                          {medecin.genre || "Genre non défini"}
                          {age !== null ? ` · ${age} ans` : ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {medecin.specialite || "Spécialité non définie"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {medecin.niveau || "Niveau non défini"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="min-w-0 space-y-1 text-xs text-muted-foreground">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{medecin.telephone || "-"}</span>
                      </div>
                      <div className="hidden min-w-0 items-center gap-1.5 xl:flex">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{medecin.email || "-"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground" title={medecin.clubNom || undefined}>
                        {medecin.clubNom || "-"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground" title={medecin.pseudoEntente || undefined}>
                        {medecin.pseudoEntente || "Pseudo non défini"}
                      </p>
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
