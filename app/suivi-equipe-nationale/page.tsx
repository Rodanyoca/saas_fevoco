import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Header } from "@/components/dashboard/header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getEquipeNationaleResultats } from "@/lib/data"
import { formatSheetDate, parseSheetDate } from "@/lib/date-utils"
import type { EquipeNationaleResultat } from "@/lib/types"
import { CalendarDays, Medal, Target, Trophy } from "lucide-react"

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

function sortResultats(items: EquipeNationaleResultat[]) {
  return [...items].sort((a, b) => {
    const dateA = parseSheetDate(a.dateMatch)?.getTime() ?? 0
    const dateB = parseSheetDate(b.dateMatch)?.getTime() ?? 0
    return dateB - dateA
  })
}

function getScorePart(scoreGlobal: string, index: number) {
  return scoreGlobal.split("-")[index]?.trim() || "-"
}

function getSetScores(resultat: EquipeNationaleResultat, side: "rdc" | "adv") {
  const sets = [
    [resultat.set1Rdc, resultat.set1Adv],
    [resultat.set2Rdc, resultat.set2Adv],
    [resultat.set3Rdc, resultat.set3Adv],
    [resultat.set4Rdc, resultat.set4Adv],
    [resultat.set5Rdc, resultat.set5Adv],
  ].filter(([rdc, adv]) => rdc !== null || adv !== null)

  return sets.map(([rdc, adv]) => String((side === "rdc" ? rdc : adv) ?? "-"))
}

function getSetPairs(resultat: EquipeNationaleResultat) {
  const sets = [
    [resultat.set1Rdc, resultat.set1Adv],
    [resultat.set2Rdc, resultat.set2Adv],
    [resultat.set3Rdc, resultat.set3Adv],
    [resultat.set4Rdc, resultat.set4Adv],
    [resultat.set5Rdc, resultat.set5Adv],
  ].filter(([rdc, adv]) => rdc !== null || adv !== null)

  return sets.map(([rdc, adv]) => `${rdc ?? "-"}-${adv ?? "-"}`).join("  ")
}

function getWinnerSide(resultat: EquipeNationaleResultat) {
  const value = normalize(resultat.resultatMatch || resultat.statutMatch)
  if (value.startsWith("v") || value.includes("gagne")) return "rdc"
  if (value.startsWith("d") || value.includes("perdu")) return "adv"

  const scoreRdc = Number(getScorePart(resultat.scoreGlobal, 0))
  const scoreAdv = Number(getScorePart(resultat.scoreGlobal, 1))
  if (!Number.isNaN(scoreRdc) && !Number.isNaN(scoreAdv)) {
    if (scoreRdc > scoreAdv) return "rdc"
    if (scoreAdv > scoreRdc) return "adv"
  }

  return null
}

export default async function SuiviEquipeNationalePage() {
  const resultats = await getEquipeNationaleResultats()

  const resultatsTries = sortResultats(resultats)
  const victoires = resultats.filter((resultat) => isWin(resultat.resultatMatch)).length
  const pointsRdc = resultats.reduce((total, resultat) => total + (resultat.totalPointRdc ?? 0), 0)
  const autresResultats = Math.max(resultats.length - victoires, 0)

  const cards = [
    { label: "Matchs", value: resultats.length, icon: Target, color: "bg-primary/10 text-primary" },
    { label: "Victoires", value: victoires, icon: Trophy, color: "bg-green-500/10 text-green-700" },
    { label: "Autres resultats", value: autresResultats, icon: Medal, color: "bg-slate-500/10 text-slate-700" },
    { label: "Points RDC", value: pointsRdc, icon: CalendarDays, color: "bg-amber-500/10 text-amber-700" },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Header title="Performance equipe nationale" subtitle="Resultats des Leopards RDC" />

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

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Resultats</CardTitle>
          </CardHeader>
          <CardContent>
            {resultatsTries.length === 0 ? (
              <div className="rounded-md border py-10 text-center text-sm text-muted-foreground">
                Aucun resultat EN disponible.
              </div>
            ) : (
              <div className="divide-y rounded-md border">
                {resultatsTries.map((resultat, index) => {
                  const winner = getWinnerSide(resultat)
                  const phase = [resultat.phase, resultat.poule ? `Poule ${resultat.poule}` : ""].filter(Boolean).join(" / ")
                  const equipeMeta = [resultat.discipline, resultat.categorie, resultat.genre].filter(Boolean).join(" / ")

                  return (
                    <div
                      key={`${resultat.idResultatEn || "resultat"}-${index}`}
                      className="grid gap-3 px-3 py-2.5 md:grid-cols-[minmax(9rem,0.72fr)_minmax(0,1.95fr)_7rem] md:items-center"
                    >
                      <div className="min-w-0">
                        <p className="whitespace-nowrap text-xs text-muted-foreground">{formatSheetDate(resultat.dateMatch)}</p>
                        <p className="text-sm font-medium leading-snug text-foreground">{resultat.nomCompetition || "-"}</p>
                        <p className="text-xs leading-snug text-muted-foreground">{phase || "-"}</p>
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div
                          className={`grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(12rem,0.8fr)] items-center gap-3 rounded-sm px-2 py-1 ${
                            winner === "rdc" ? "bg-primary/10" : ""
                          }`}
                        >
                          <div className="min-w-0">
                            <p className={`text-sm leading-snug ${winner === "rdc" ? "font-semibold text-foreground" : "font-medium"}`}>
                              {resultat.nomEquipeNationale || "Leopards RDC"}
                            </p>
                            <p className="text-xs leading-snug text-muted-foreground">{equipeMeta || "-"}</p>
                          </div>
                          <div className="grid min-w-0 grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-2">
                            <span className={`text-right font-mono text-2xl leading-none ${winner === "rdc" ? "font-bold text-primary" : "font-semibold"}`}>
                              {getScorePart(resultat.scoreGlobal, 0)}
                            </span>
                            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                              {getSetScores(resultat, "rdc").map((set, setIndex) => (
                                <span key={`${set}-${setIndex}`} className="font-mono text-[11px] text-muted-foreground">
                                  {set}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(12rem,0.8fr)] items-center gap-3 rounded-sm px-2 py-1 ${
                            winner === "adv" ? "bg-primary/10" : ""
                          }`}
                        >
                          <div className="min-w-0">
                            <p className={`text-sm leading-snug ${winner === "adv" ? "font-semibold text-foreground" : "font-medium"}`}>
                              {resultat.adversaire || "-"}
                            </p>
                            <p className="text-xs leading-snug text-muted-foreground">{resultat.paysAdversaire || "-"}</p>
                          </div>
                          <div className="grid min-w-0 grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-2">
                            <span className={`text-right font-mono text-2xl leading-none ${winner === "adv" ? "font-bold text-primary" : "font-semibold"}`}>
                              {getScorePart(resultat.scoreGlobal, 1)}
                            </span>
                            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                              {getSetScores(resultat, "adv").map((set, setIndex) => (
                                <span key={`${set}-${setIndex}`} className="font-mono text-[11px] text-muted-foreground">
                                  {set}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="md:text-right">
                        <Badge variant="outline">{resultat.resultatMatch || resultat.statutMatch || "-"}</Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
