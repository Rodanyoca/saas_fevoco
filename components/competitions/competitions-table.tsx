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
import type { Competition } from "@/lib/types"
import { CalendarDays, Eye, Trophy } from "lucide-react"
import { formatSheetDate } from "@/lib/date-utils"

function formatDate(value: string) {
  return formatSheetDate(value)
}

function getStatusClass(statut: string) {
  const value = statut.trim().toLowerCase()
  if (value === "en cours" || value === "active" || value === "actif") {
    return "bg-green-100 text-green-800 hover:bg-green-100"
  }
  if (value === "terminee" || value === "termine") {
    return "bg-slate-100 text-slate-700 hover:bg-slate-100"
  }
  return "bg-blue-100 text-blue-800 hover:bg-blue-100"
}

export function CompetitionsTable({
  competitions,
  totalCount,
  onViewCompetition,
}: {
  competitions: Competition[]
  totalCount: number
  onViewCompetition: (competition: Competition) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Trophy className="h-5 w-5 text-primary" />
            Liste des competitions
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {totalCount} competitions
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[860px] table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[20%]">Compétition</TableHead>
                <TableHead className="w-[9%]">Saison</TableHead>
                <TableHead className="w-[12%]">Discipline</TableHead>
                <TableHead className="w-[20%]">Période</TableHead>
                <TableHead className="w-[15%]">Niveau / lieu</TableHead>
                <TableHead className="w-[14%]">Organisation</TableHead>
                <TableHead className="w-[7%] text-center">Statut</TableHead>
                <TableHead className="w-[3%] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitions.map((competition, index) => {
                return (
                  <TableRow key={`${competition.idCompetition || "competition"}-${competition.nomCompetition || "sans-nom"}-${index}`}>
                    <TableCell className="whitespace-normal break-words font-medium leading-snug">
                      {competition.nomCompetition}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{competition.saison || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{competition.nomDiscipline || "-"}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1.5 whitespace-nowrap text-xs leading-none xl:text-sm">
                        <CalendarDays className="h-4 w-4 shrink-0" />
                        <span>
                          {formatDate(competition.dateDebut)} - {formatDate(competition.dateFin)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell><p>{competition.niveau || "-"}</p><p className="text-xs text-muted-foreground">{competition.lieu || "-"}</p></TableCell>
                    <TableCell>{competition.nomStructureOrganisatrice || "-"}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={getStatusClass(competition.statutCompetition)}>
                        {competition.statutCompetition}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewCompetition(competition)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Voir les details</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
