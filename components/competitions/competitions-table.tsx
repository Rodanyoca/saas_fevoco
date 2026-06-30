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
import type { Competition, CompetitionResult, CompetitionUnite } from "@/lib/types"
import { CalendarDays, ClipboardList, Eye, Shield, Trophy, UserRound } from "lucide-react"

function formatDate(value: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function isIndoor(discipline: string) {
  return discipline.trim().toUpperCase() === "INDOOR"
}

function getUnitCount(competition: Competition, unites: CompetitionUnite[]) {
  return unites.filter((unite) => unite.idCompetition === competition.id).length
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
  unites,
  results,
  totalCount,
  onViewCompetition,
}: {
  competitions: Competition[]
  unites: CompetitionUnite[]
  results: CompetitionResult[]
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
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Competition</TableHead>
                <TableHead>Discipline</TableHead>
                <TableHead>Periode</TableHead>
                <TableHead className="text-center">Unites</TableHead>
                <TableHead className="text-center">Matchs</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitions.map((competition) => {
                const indoor = isIndoor(competition.discipline)
                const UnitIcon = indoor ? Shield : UserRound
                const matchCount = results.filter(
                  (result) => result.idCompetition === competition.id,
                ).length

                return (
                  <TableRow key={competition.id}>
                    <TableCell className="font-mono text-muted-foreground">
                      {competition.id}
                    </TableCell>
                    <TableCell className="whitespace-normal break-words font-medium leading-snug">
                      {competition.nomCompetition}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{competition.discipline}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1.5 whitespace-nowrap text-xs leading-none xl:text-sm">
                        <CalendarDays className="h-4 w-4 shrink-0" />
                        <span>
                          {formatDate(competition.dateDebut)} - {formatDate(competition.dateFin)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-2">
                        <UnitIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{getUnitCount(competition, unites)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-2">
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                        <span>{matchCount}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={getStatusClass(competition.statut)}>
                        {competition.statut}
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
