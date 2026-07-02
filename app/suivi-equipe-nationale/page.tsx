import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getEquipeNationaleCompetitions, getEquipeNationaleResultats } from "@/lib/data"
import { formatSheetDate, parseSheetDate } from "@/lib/date-utils"
import type { EquipeNationaleCompetition, EquipeNationaleResultat } from "@/lib/types"
import { CalendarCheck, Medal, Target, Trophy } from "lucide-react"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function isWin(value: string) {
  const v = normalize(value)
  return v.startsWith("v") || v.includes("gagne")
}

function sortCompetitions(items: EquipeNationaleCompetition[]) {
  return [...items].sort((a, b) => {
    const dateA = parseSheetDate(a.dateDebut)?.getTime() ?? 0
    const dateB = parseSheetDate(b.dateDebut)?.getTime() ?? 0
    return dateB - dateA
  })
}

function sortResultats(items: EquipeNationaleResultat[]) {
  return [...items].sort((a, b) => {
    const dateA = parseSheetDate(a.dateMatch)?.getTime() ?? 0
    const dateB = parseSheetDate(b.dateMatch)?.getTime() ?? 0
    return dateB - dateA
  })
}

function formatSetScores(resultat: EquipeNationaleResultat) {
  const sets = [
    [resultat.set1Rdc, resultat.set1Adv],
    [resultat.set2Rdc, resultat.set2Adv],
    [resultat.set3Rdc, resultat.set3Adv],
    [resultat.set4Rdc, resultat.set4Adv],
    [resultat.set5Rdc, resultat.set5Adv],
  ].filter(([rdc, adv]) => rdc !== null || adv !== null)

  return sets.map(([rdc, adv]) => `${rdc ?? "-"}-${adv ?? "-"}`).join(" | ") || "-"
}

export default async function SuiviEquipeNationalePage() {
  const [competitions, resultats] = await Promise.all([
    getEquipeNationaleCompetitions(),
    getEquipeNationaleResultats(),
  ])

  const competitionsTriees = sortCompetitions(competitions)
  const resultatsTries = sortResultats(resultats)
  const victoires = resultats.filter((resultat) => isWin(resultat.resultatMatch)).length
  const pointsRdc = resultats.reduce((total, resultat) => total + (resultat.totalPointRdc ?? 0), 0)

  const cards = [
    { label: "Competitions", value: competitions.length, icon: CalendarCheck, color: "bg-primary/10 text-primary" },
    { label: "Matchs", value: resultats.length, icon: Target, color: "bg-blue-500/10 text-blue-700" },
    { label: "Victoires", value: victoires, icon: Trophy, color: "bg-green-500/10 text-green-700" },
    { label: "Points RDC", value: pointsRdc, icon: Medal, color: "bg-amber-500/10 text-amber-700" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Header title="Performance equipe nationale" subtitle="Competitions et resultats des Leopards RDC" />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Card key={card.label} className="border-border/50">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`rounded-lg p-3 ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="competitions" className="w-full">
          <TabsList className="grid h-10 w-full grid-cols-2">
            <TabsTrigger value="competitions">Competitions</TabsTrigger>
            <TabsTrigger value="resultats">Resultats</TabsTrigger>
          </TabsList>

          <TabsContent value="competitions" className="mt-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Competitions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="min-w-[1080px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipe</TableHead>
                        <TableHead>Competition</TableHead>
                        <TableHead>Niveau</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead>Lieu</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Observation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {competitionsTriees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                            Aucune competition EN disponible.
                          </TableCell>
                        </TableRow>
                      ) : (
                        competitionsTriees.map((competition, index) => (
                          <TableRow key={`${competition.idParticipationEn || "participation"}-${index}`}>
                            <TableCell>
                              <p className="font-medium">{competition.nomEquipeNationale || "-"}</p>
                              <p className="text-xs text-muted-foreground">
                                {competition.discipline || "-"} / {competition.categorie || "-"} / {competition.genre || "-"}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{competition.nomCompetition || "-"}</p>
                              <p className="font-mono text-xs text-muted-foreground">{competition.idCompetition || "-"}</p>
                            </TableCell>
                            <TableCell>{competition.niveauCompetition || "-"}</TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {formatSheetDate(competition.dateDebut)} - {formatSheetDate(competition.dateFin)}
                            </TableCell>
                            <TableCell>{competition.lieu || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{competition.statutParticipation || "-"}</Badge>
                            </TableCell>
                            <TableCell className="max-w-[260px] text-muted-foreground">
                              {competition.observation || "-"}
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

          <TabsContent value="resultats" className="mt-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Resultats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table className="min-w-[1120px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Equipe</TableHead>
                        <TableHead>Competition</TableHead>
                        <TableHead>Phase</TableHead>
                        <TableHead>Adversaire</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Resultat</TableHead>
                        <TableHead>Observation</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resultatsTries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center text-sm text-muted-foreground">
                            Aucun resultat EN disponible.
                          </TableCell>
                        </TableRow>
                      ) : (
                        resultatsTries.map((resultat, index) => (
                          <TableRow key={`${resultat.idResultatEn || "resultat"}-${index}`}>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {formatSheetDate(resultat.dateMatch)}
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{resultat.nomEquipeNationale || "-"}</p>
                              <p className="text-xs text-muted-foreground">
                                {resultat.discipline || "-"} / {resultat.categorie || "-"} / {resultat.genre || "-"}
                              </p>
                            </TableCell>
                            <TableCell>{resultat.nomCompetition || "-"}</TableCell>
                            <TableCell>
                              <p>{resultat.phase || "-"}</p>
                              <p className="text-xs text-muted-foreground">{resultat.poule || "-"}</p>
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{resultat.adversaire || "-"}</p>
                              <p className="text-xs text-muted-foreground">{resultat.paysAdversaire || "-"}</p>
                            </TableCell>
                            <TableCell>
                              <p className="font-mono text-lg font-semibold">{resultat.scoreGlobal || "-"}</p>
                              <p className="font-mono text-xs text-muted-foreground">{formatSetScores(resultat)}</p>
                            </TableCell>
                            <TableCell className="font-mono">
                              {resultat.totalPointRdc ?? "-"} - {resultat.totalPointAdv ?? "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{resultat.resultatMatch || resultat.statutMatch || "-"}</Badge>
                            </TableCell>
                            <TableCell className="max-w-[240px] text-muted-foreground">
                              {resultat.observation || "-"}
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
    </DashboardLayout>
  )
}
