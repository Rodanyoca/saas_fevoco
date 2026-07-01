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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Mail, Phone } from "lucide-react"
import type { Arbitre } from "@/lib/types"
import { calculateAgeFromSheetDate, formatSheetDate } from "@/lib/date-utils"

interface ArbitresTableProps {
  arbitres: Arbitre[]
  onViewArbitre: (arbitre: Arbitre) => void
}

export function ArbitresTable({ arbitres, onViewArbitre }: ArbitresTableProps) {
  const formatArbitreId = (id: string) => {
    const numeric = id.replace(/\D/g, "")
    return numeric ? numeric.padStart(7, "0") : id
  }

  const getInitials = (nomComplet: string) => {
    const parts = nomComplet.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return "A"
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase()
  }

  const getStatutBadge = (statut: Arbitre["statut"]) => {
    switch (statut) {
      case "actif":
        return <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">Actif</Badge>
      case "inactif":
        return <Badge variant="secondary">Inactif</Badge>
      case "suspendu":
        return <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20">Suspendu</Badge>
      default:
        return <Badge variant="outline">{statut || "Non défini"}</Badge>
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Liste des arbitres ({arbitres.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="hidden w-[84px] lg:table-cell">ID</TableHead>
              <TableHead>Arbitre</TableHead>
              <TableHead className="w-[15%]">Grade</TableHead>
              <TableHead className="hidden w-[24%] md:table-cell">Ligue</TableHead>
              <TableHead className="hidden w-[18%] lg:table-cell">Contact</TableHead>
              <TableHead className="hidden w-[130px] xl:table-cell">Homologation</TableHead>
              <TableHead className="w-[92px]">Statut</TableHead>
              <TableHead className="w-[44px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {arbitres.map((arbitre, index) => {
              const age = calculateAgeFromSheetDate(arbitre.dateNaissance)

              return (
                <TableRow key={`${arbitre.id || "arbitre"}-${arbitre.nomComplet || "sans-nom"}-${index}`} className="hover:bg-muted/50">
                  <TableCell className="hidden font-mono text-xs text-muted-foreground lg:table-cell">
                    {formatArbitreId(arbitre.id)}
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(arbitre.nomComplet)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{arbitre.nomComplet}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {arbitre.genre || "Genre non défini"}
                        {age !== null ? ` · ${age} ans` : ""}
                      </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="max-w-full truncate">
                      {arbitre.grade || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden whitespace-normal md:table-cell">
                    <div className="min-w-0">
                      <p className="whitespace-normal break-words font-medium leading-snug text-foreground [overflow-wrap:anywhere]">
                        {arbitre.ligueNom || "-"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {arbitre.equipeNational || "Équipe nationale non définie"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="min-w-0 space-y-1 text-xs text-muted-foreground">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{arbitre.telephone || "-"}</span>
                      </div>
                      <div className="hidden min-w-0 items-center gap-1.5 xl:flex">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{arbitre.email || "-"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground xl:table-cell">
                    {formatSheetDate(arbitre.dateHomologation)}
                  </TableCell>
                  <TableCell>{getStatutBadge(arbitre.statut)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onViewArbitre(arbitre)}
                      aria-label={`Voir ${arbitre.nomComplet}`}
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
