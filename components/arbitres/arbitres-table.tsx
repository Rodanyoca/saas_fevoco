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
import type { Arbitre } from "@/lib/types"
import { Eye, Mail, Phone } from "lucide-react"

interface ArbitresTableProps {
  arbitres: Arbitre[]
  onViewArbitre: (arbitre: Arbitre) => void
}

export function ArbitresTable({ arbitres, onViewArbitre }: ArbitresTableProps) {
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
        return <Badge variant="outline">{statut || "Non defini"}</Badge>
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Liste des arbitres ({arbitres.length})</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <Table className="min-w-[920px]">
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[110px]">ID</TableHead>
              <TableHead className="min-w-[230px]">Arbitre</TableHead>
              <TableHead className="w-[150px]">Grade</TableHead>
              <TableHead className="w-[190px]">Equipe nationale</TableHead>
              <TableHead className="w-[210px]">Contact</TableHead>
              <TableHead className="w-[132px]">Homologation</TableHead>
              <TableHead className="w-[96px]">Statut</TableHead>
              <TableHead className="w-[44px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {arbitres.map((arbitre, index) => {
              const age = calculateAgeFromSheetDate(arbitre.dateNaissance)

              return (
                <TableRow
                  key={`${arbitre.id || "arbitre"}-${arbitre.nomComplet || "sans-nom"}-${index}`}
                  className="hover:bg-muted/50"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {arbitre.id || "-"}
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
                          {arbitre.genre || "Genre non defini"}
                          {age !== null ? ` - ${age} ans` : ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="max-w-full truncate">
                      {arbitre.grade || "-"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="truncate font-medium text-foreground">{arbitre.equipeNational || "-"}</p>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0 space-y-1 text-xs text-muted-foreground">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{arbitre.telephone || "-"}</span>
                      </div>
                      <div className="flex min-w-0 items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{arbitre.email || "-"}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
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
