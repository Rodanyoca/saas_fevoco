"use client"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Competition, CompetitionParticipant, CompetitionResult, CompetitionUnite } from "@/lib/types"
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  ListOrdered,
  MapPin,
  Medal,
  Shield,
  Trophy,
  UserRound,
  Users,
} from "lucide-react"

function formatDate(value: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

function isIndoor(discipline: string) {
  return discipline.trim().toUpperCase() === "INDOOR"
}

function getStatusClass(statut: string) {
  const value = statut.trim().toLowerCase()
  if (value === "qualifie" || value === "gagne" || value === "vainqueur" || value === "actif") {
    return "bg-green-100 text-green-800 hover:bg-green-100"
  }
  if (value === "perdu" || value === "elimine" || value === "forfait") {
    return "bg-red-100 text-red-800 hover:bg-red-100"
  }
  return "bg-slate-100 text-slate-700 hover:bg-slate-100"
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Trophy
  label: string
  value: string
}) {
  return (
    <div className="grid grid-cols-[1rem_minmax(7rem,auto)_minmax(0,1fr)] items-start gap-3 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-right font-medium leading-relaxed text-foreground">
        {value || "-"}
      </span>
    </div>
  )
}

function EmptyTableRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center text-sm text-muted-foreground">
        {label}
      </TableCell>
    </TableRow>
  )
}

type WinnerSide = "A" | "B" | null

type RankingRow = {
  id: string
  participant: string
  poule: string
  played: number
  won: number
  lost: number
  setsFor: number
  setsAgainst: number
  pointsFor: number
  pointsAgainst: number
}

const setKeys = [
  ["set1A", "set1B"],
  ["set2A", "set2B"],
  ["set3A", "set3B"],
  ["set4A", "set4B"],
  ["set5A", "set5B"],
] as const

function normalizeValue(value: string) {
  return value.trim().toLowerCase()
}

function getParticipantLabel(participant: CompetitionParticipant) {
  return (
    participant.nomClub ||
    participant.nomAthlete ||
    participant.idParticipation ||
    "-"
  )
}

function getBeachUnitStatus(unit: CompetitionUnite, participants: CompetitionParticipant[]) {
  const athleteIds = [unit.idAthleteA, unit.idAthleteB].filter(Boolean)
  const athleteNames = [unit.nomAthleteA, unit.nomAthleteB].filter(Boolean)
  const statuses = participants
    .filter((participant) => {
      if (participant.idCompetition !== unit.idCompetition) return false
      if (athleteIds.includes(participant.idAthlete)) return true
      return athleteNames.includes(participant.nomAthlete)
    })
    .map((participant) => participant.statutParticipation)
    .filter(Boolean)

  return Array.from(new Set(statuses)).join(" / ")
}

function getScorePart(scoreGlobal: string, index: number) {
  return scoreGlobal.split("-")[index]?.trim() || "-"
}

function getUnitSetDetails(result: CompetitionResult, side: "A" | "B") {
  return setKeys
    .map(([keyA, keyB]) => {
      const score = side === "A" ? result[keyA] : result[keyB]
      if (score === null) return null
      return String(score)
    })
    .filter(Boolean)
}

function getSetStats(result: CompetitionResult) {
  return setKeys.reduce(
    (stats, [keyA, keyB]) => {
      const a = result[keyA]
      const b = result[keyB]
      if (a === null || b === null) return stats

      stats.pointsA += a
      stats.pointsB += b

      if (a > b) {
        stats.setsA += 1
      } else if (b > a) {
        stats.setsB += 1
      }

      return stats
    },
    { setsA: 0, setsB: 0, pointsA: 0, pointsB: 0 },
  )
}

function getWinnerSide(result: CompetitionResult): WinnerSide {
  const vainqueur = normalizeValue(result.idUniteVainqueur)
  if (vainqueur) {
    if (
      vainqueur === normalizeValue(result.idUniteA) ||
      vainqueur === normalizeValue(result.nomUniteA)
    ) {
      return "A"
    }

    if (
      vainqueur === normalizeValue(result.idUniteB) ||
      vainqueur === normalizeValue(result.nomUniteB)
    ) {
      return "B"
    }
  }

  const stats = getSetStats(result)
  if (stats.setsA > stats.setsB) return "A"
  if (stats.setsB > stats.setsA) return "B"

  return null
}

function isWinningUnit(result: CompetitionResult, side: WinnerSide) {
  return getWinnerSide(result) === side
}

function buildRanking(
  unites: CompetitionUnite[],
  results: CompetitionResult[],
): RankingRow[] {
  const rows = new Map<string, RankingRow>()

  const ensureRow = (id: string, participant: string, poule: string) => {
    const rowId = id || participant
    if (!rowId) return null

    const existing = rows.get(rowId)
    if (existing) {
      if (!existing.participant && participant) existing.participant = participant
      if (!existing.poule && poule) existing.poule = poule
      return existing
    }

    const row: RankingRow = {
      id: rowId,
      participant: participant || rowId,
      poule,
      played: 0,
      won: 0,
      lost: 0,
      setsFor: 0,
      setsAgainst: 0,
      pointsFor: 0,
      pointsAgainst: 0,
    }

    rows.set(rowId, row)
    return row
  }

  unites.forEach((unite) => {
    ensureRow(unite.idUnite, unite.nomUnite, unite.poule)
  })

  results.forEach((result) => {
    const rowA = ensureRow(result.idUniteA, result.nomUniteA, result.poule)
    const rowB = ensureRow(result.idUniteB, result.nomUniteB, result.poule)
    if (!rowA || !rowB) return

    const winner = getWinnerSide(result)
    const stats = getSetStats(result)
    const pointsA = result.totalPointA ?? stats.pointsA
    const pointsB = result.totalPointB ?? stats.pointsB

    rowA.setsFor += stats.setsA
    rowA.setsAgainst += stats.setsB
    rowA.pointsFor += pointsA
    rowA.pointsAgainst += pointsB

    rowB.setsFor += stats.setsB
    rowB.setsAgainst += stats.setsA
    rowB.pointsFor += pointsB
    rowB.pointsAgainst += pointsA

    if (!winner) return

    rowA.played += 1
    rowB.played += 1

    if (winner === "A") {
      rowA.won += 1
      rowB.lost += 1
    } else {
      rowB.won += 1
      rowA.lost += 1
    }
  })

  return Array.from(rows.values()).sort((a, b) => {
    const pouleOrder = a.poule.localeCompare(b.poule)
    if (pouleOrder !== 0) return pouleOrder
    if (b.won !== a.won) return b.won - a.won
    if (b.setsFor - b.setsAgainst !== a.setsFor - a.setsAgainst) {
      return b.setsFor - b.setsAgainst - (a.setsFor - a.setsAgainst)
    }
    if (b.pointsFor - b.pointsAgainst !== a.pointsFor - a.pointsAgainst) {
      return b.pointsFor - b.pointsAgainst - (a.pointsFor - a.pointsAgainst)
    }
    return a.participant.localeCompare(b.participant)
  })
}

export function CompetitionDetail({
  competition,
  participants,
  unites,
  results,
  onBack,
}: {
  competition: Competition
  participants: CompetitionParticipant[]
  unites: CompetitionUnite[]
  results: CompetitionResult[]
  onBack: () => void
}) {
  const [rankingPoule, setRankingPoule] = useState("all")
  const [rankingPhase, setRankingPhase] = useState("all")
  const indoor = isIndoor(competition.discipline)
  const competitionParticipants = participants.filter(
    (participant) => participant.idCompetition === competition.id,
  )
  const competitionUnites = unites.filter((unite) => unite.idCompetition === competition.id)
  const competitionResults = results
    .filter((result) => result.idCompetition === competition.id)
    .sort((a, b) => {
      const dateA = new Date(a.dateMatch).getTime()
      const dateB = new Date(b.dateMatch).getTime()
      if (Number.isNaN(dateA) || Number.isNaN(dateB)) {
        return a.idResultat.localeCompare(b.idResultat)
      }
      return dateA - dateB
    })
  const rankingPoules = useMemo(
    () =>
      Array.from(
        new Set(
          [...competitionUnites.map((unite) => unite.poule), ...competitionResults.map((result) => result.poule)]
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [competitionResults, competitionUnites],
  )
  const rankingPhases = useMemo(
    () =>
      Array.from(
        new Set(
          competitionResults
            .map((result) => result.phase.trim())
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [competitionResults],
  )
  const rankingResults = competitionResults.filter((result) => {
    if (rankingPoule !== "all" && result.poule !== rankingPoule) return false
    if (rankingPhase !== "all" && result.phase !== rankingPhase) return false
    return true
  })
  const rankingResultUnitIds = new Set(
    rankingResults.flatMap((result) => [result.idUniteA, result.idUniteB]).filter(Boolean),
  )
  const rankingUnites = competitionUnites.filter((unite) => {
    if (rankingPoule !== "all" && unite.poule !== rankingPoule) return false
    if (rankingPhase !== "all" && !rankingResultUnitIds.has(unite.idUnite)) return false
    return true
  })
  const ranking = buildRanking(rankingUnites, rankingResults)
  const unitLabel = indoor ? "Clubs engages" : "Paires engagees"
  const unitCount = competitionUnites.length
  const displayedParticipants = indoor ? competitionParticipants : competitionUnites

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{competition.nomCompetition}</h1>
            <p className="text-muted-foreground">Details de la competition</p>
          </div>
        </div>
        <Badge variant="outline">{competition.discipline}</Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <Trophy className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{competition.nomCompetition}</h2>
              <p className="text-muted-foreground">{competition.niveau}</p>
              <div className="mt-6 w-full space-y-3 text-left">
                <InfoRow icon={MapPin} label="Lieu:" value={competition.lieu} />
                <InfoRow icon={Medal} label="Statut:" value={competition.statut} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-5 w-5 text-primary" />
              Calendrier
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={CalendarDays} label="Debut:" value={formatDate(competition.dateDebut)} />
            <InfoRow icon={CalendarDays} label="Fin:" value={formatDate(competition.dateFin)} />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {indoor ? (
                <Shield className="h-5 w-5 text-primary" />
              ) : (
                <UserRound className="h-5 w-5 text-primary" />
              )}
              Unite engagee
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border/50 p-4 text-center">
              <Users className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-3xl font-bold text-foreground">{unitCount}</p>
              <p className="text-sm text-muted-foreground">{unitLabel}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="participation" className="gap-4">
        <TabsList className="grid h-auto w-full grid-cols-3">
          <TabsTrigger value="participation" className="justify-center text-center">
            Participants
          </TabsTrigger>
          <TabsTrigger value="resultats" className="justify-center text-center">
            Resultats
          </TabsTrigger>
          <TabsTrigger value="classement" className="justify-center text-center">
            Classement
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participation">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {indoor ? (
                  <Shield className="h-5 w-5 text-primary" />
                ) : (
                  <UserRound className="h-5 w-5 text-primary" />
                )}
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    {indoor ? (
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Poule</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableHead>Athlete</TableHead>
                        <TableHead>Club</TableHead>
                        <TableHead>Poule</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    )}
                  </TableHeader>
                  <TableBody>
                    {displayedParticipants.length === 0 ? (
                      <EmptyTableRow
                        colSpan={indoor ? 3 : 4}
                        label="Aucun participant disponible."
                      />
                    ) : indoor ? (
                      competitionParticipants.map((participant) => (
                        <TableRow key={participant.idParticipation}>
                          <TableCell className="font-medium">
                            {participant.nomClub || getParticipantLabel(participant)}
                          </TableCell>
                          <TableCell>{participant.poule || "-"}</TableCell>
                          <TableCell>
                            {participant.statutParticipation ? (
                              <Badge className={getStatusClass(participant.statutParticipation)}>
                                {participant.statutParticipation}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      competitionUnites.map((unite) => {
                        const status = getBeachUnitStatus(unite, competitionParticipants)
                        const athletes = [unite.nomAthleteA, unite.nomAthleteB].filter(Boolean).join(" / ")

                        return (
                          <TableRow key={unite.idUnite}>
                            <TableCell className="font-medium">
                              {athletes || "-"}
                            </TableCell>
                            <TableCell>{unite.nomClub || "-"}</TableCell>
                            <TableCell>{unite.poule || "-"}</TableCell>
                            <TableCell>
                              {status ? (
                                <Badge className={getStatusClass(status)}>{status}</Badge>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resultats">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Resultats
              </CardTitle>
            </CardHeader>
            <CardContent>
              {competitionResults.length === 0 ? (
                <div className="rounded-md border py-10 text-center text-sm text-muted-foreground">
                  Aucun resultat disponible.
                </div>
              ) : (
                <div className="space-y-2">
                  {competitionResults.map((result) => (
                    <div
                      key={result.idResultat}
                      className="grid gap-3 rounded-md border px-3 py-2.5 md:grid-cols-[minmax(7rem,0.75fr)_minmax(0,1.45fr)_minmax(12rem,0.8fr)] md:items-center"
                    >
                      <div className="flex min-w-0 flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground md:block md:space-y-0.5">
                        <p>{formatDate(result.dateMatch)}</p>
                        <p>{result.phase || "-"} / Poule {result.poule || "-"}</p>
                      </div>
                      <div className="min-w-0 space-y-1.5 md:col-span-2">
                        <div
                          className={`grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-sm px-2 py-1 md:grid-cols-[minmax(0,1.45fr)_minmax(12rem,0.8fr)] ${
                            isWinningUnit(result, "A") ? "bg-primary/10" : ""
                          }`}
                        >
                          <div className="min-w-0">
                            <span
                              className={`block truncate whitespace-nowrap text-sm ${
                                isWinningUnit(result, "A") ? "font-semibold text-foreground" : "font-medium"
                              }`}
                            >
                              {result.nomUniteA || result.idUniteA || "-"}
                            </span>
                          </div>
                          <div className="grid min-w-0 grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-2">
                            <span
                              className={`text-right font-mono text-2xl leading-none ${
                                isWinningUnit(result, "A") ? "font-bold text-primary" : "font-semibold"
                              }`}
                            >
                              {getScorePart(result.scoreGlobal, 0)}
                            </span>
                            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                              {getUnitSetDetails(result, "A").map((detail, index) => (
                                <span
                                  key={`${detail}-${index}`}
                                  className="font-mono text-[11px] text-muted-foreground"
                                >
                                  {detail}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-sm px-2 py-1 md:grid-cols-[minmax(0,1.45fr)_minmax(12rem,0.8fr)] ${
                            isWinningUnit(result, "B") ? "bg-primary/10" : ""
                          }`}
                        >
                          <div className="min-w-0">
                            <span
                              className={`block truncate whitespace-nowrap text-sm ${
                                isWinningUnit(result, "B") ? "font-semibold text-foreground" : "font-medium"
                              }`}
                            >
                              {result.nomUniteB || result.idUniteB || "-"}
                            </span>
                          </div>
                          <div className="grid min-w-0 grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-2">
                            <span
                              className={`text-right font-mono text-2xl leading-none ${
                                isWinningUnit(result, "B") ? "font-bold text-primary" : "font-semibold"
                              }`}
                            >
                              {getScorePart(result.scoreGlobal, 1)}
                            </span>
                            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                              {getUnitSetDetails(result, "B").map((detail, index) => (
                                <span
                                  key={`${detail}-${index}`}
                                  className="font-mono text-[11px] text-muted-foreground"
                                >
                                  {detail}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classement">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ListOrdered className="h-5 w-5 text-primary" />
                  Classement
                </CardTitle>

                <div className="grid grid-cols-2 gap-3 lg:w-[22rem]">
                  <Select value={rankingPoule} onValueChange={setRankingPoule}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Poule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les poules</SelectItem>
                      {rankingPoules.map((poule) => (
                        <SelectItem key={poule} value={poule}>
                          {poule}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={rankingPhase} onValueChange={setRankingPhase}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les phases</SelectItem>
                      {rankingPhases.map((phase) => (
                        <SelectItem key={phase} value={phase}>
                          {phase}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[72px] text-center">Rang</TableHead>
                      <TableHead>Participant</TableHead>
                      <TableHead>Poule</TableHead>
                      <TableHead className="text-center">J</TableHead>
                      <TableHead className="text-center">G</TableHead>
                      <TableHead className="text-center">P</TableHead>
                      <TableHead className="text-center">Sets</TableHead>
                      <TableHead className="text-center">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ranking.length === 0 ? (
                      <EmptyTableRow colSpan={8} label="Aucun classement disponible." />
                    ) : (
                      ranking.map((row, index) => (
                        <TableRow key={row.id}>
                          <TableCell className="text-center font-mono text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell className="font-medium">{row.participant}</TableCell>
                          <TableCell>{row.poule || "-"}</TableCell>
                          <TableCell className="text-center">{row.played}</TableCell>
                          <TableCell className="text-center">{row.won}</TableCell>
                          <TableCell className="text-center">{row.lost}</TableCell>
                          <TableCell className="text-center">
                            {row.setsFor}-{row.setsAgainst}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.pointsFor}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  )
}
