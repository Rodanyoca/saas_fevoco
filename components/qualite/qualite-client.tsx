"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { getGlobalQualityRate, type QualityStat } from "@/lib/quality"

const QUALITY_GROUPS = [
  {
    title: "Structure territoriale",
    entities: ["Provinces", "Ligues", "Ententes", "Clubs"],
  },
  {
    title: "Acteurs",
    entities: ["Athletes", "Coachs", "Officiels", "Arbitres", "Medecins"],
  },
  {
    title: "Competitions",
    entities: [
      "Competitions",
      "Participants competitions",
      "Unites competitions",
      "Resultats competitions",
      "Classement competitions",
    ],
  },
  {
    title: "Mouvements et equipe nationale",
    entities: [
      "Transferts",
      "Equipe nationale",
      "Selections equipe nationale",
      "Competitions equipe nationale",
      "Resultats equipe nationale",
    ],
  },
]

function getStatus(stat: QualityStat) {
  if (stat.total === 0) return { label: "Vide", className: "border-muted-foreground/30 text-muted-foreground" }
  if (stat.tauxCompletude >= 95) return { label: "OK", className: "border-emerald-500/40 text-emerald-700" }
  if (stat.tauxCompletude >= 75) return { label: "A verifier", className: "border-amber-500/40 text-amber-700" }
  return { label: "A completer", className: "border-red-500/40 text-red-700" }
}

function QualityLine({ stat }: { stat: QualityStat }) {
  const status = getStatus(stat)

  return (
    <div className="grid gap-2 border-b border-border/60 py-2 last:border-0 md:grid-cols-[minmax(0,1.5fr)_4.25rem_4.25rem_4.25rem_minmax(7rem,0.7fr)_6.75rem] md:items-center">
      <div className="min-w-0 break-words text-sm font-medium leading-snug text-foreground">{stat.entite}</div>
      <div className="text-xs text-muted-foreground md:text-right">
        Total <span className="font-medium text-foreground">{stat.total}</span>
      </div>
      <div className="text-xs text-muted-foreground md:text-right">
        OK <span className="font-medium text-foreground">{stat.complets}</span>
      </div>
      <div className="text-xs text-muted-foreground md:text-right">
        Reste <span className="font-medium text-foreground">{stat.incomplets}</span>
      </div>
      <div className="flex items-center gap-2">
        <Progress value={stat.tauxCompletude} className="h-1.5 min-w-20 flex-1" />
        <span className="w-9 text-right text-xs font-medium text-foreground">{stat.tauxCompletude}%</span>
      </div>
      <Badge variant="outline" className={`w-fit justify-self-start whitespace-nowrap text-[11px] md:justify-self-end ${status.className}`}>
        {status.label}
      </Badge>
    </div>
  )
}

function GroupCard({ title, stats }: { title: string; stats: QualityStat[] }) {
  const total = stats.reduce((sum, stat) => sum + stat.total, 0)
  const incomplete = stats.reduce((sum, stat) => sum + stat.incomplets, 0)
  const rate = getGlobalQualityRate(stats)

  return (
    <Card className="overflow-hidden rounded-md">
      <CardHeader className="flex-row items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <CardTitle className="break-words text-sm font-semibold">{title}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {total} lignes, {incomplete} a completer
          </p>
        </div>
        <div className="min-w-20 pt-1 text-right">
          <div className="text-sm font-semibold tabular-nums">{rate}%</div>
          <Progress value={rate} className="mt-1 h-1" />
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-0">
        {stats.length ? (
          <div>{stats.map((stat) => <QualityLine key={stat.entite} stat={stat} />)}</div>
        ) : (
          <p className="py-3 text-sm text-muted-foreground">Aucune donnee pour ce bloc.</p>
        )}
      </CardContent>
    </Card>
  )
}

export function QualiteClient({ stats }: { stats: QualityStat[] }) {
  const [search, setSearch] = useState("")

  const filteredStats = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return stats
    return stats.filter((stat) => stat.entite.toLowerCase().includes(term))
  }, [search, stats])

  const groupedStats = useMemo(() => {
    return QUALITY_GROUPS.map((group) => ({
      ...group,
      stats: group.entities
        .map((entity) => filteredStats.find((stat) => stat.entite === entity))
        .filter((stat): stat is QualityStat => Boolean(stat)),
    })).filter((group) => group.stats.length > 0)
  }, [filteredStats])

  const totalRows = filteredStats.reduce((sum, stat) => sum + stat.total, 0)
  const totalIncomplete = filteredStats.reduce((sum, stat) => sum + stat.incomplets, 0)
  const globalRate = getGlobalQualityRate(filteredStats)

  return (
    <div className="space-y-4">
      <Card className="rounded-md">
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_11rem_11rem_11rem] md:items-end">
          <div className="min-w-0">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="quality-search">
              Rechercher une feuille
            </label>
            <Input
              id="quality-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Ex. clubs, resultats, equipe nationale..."
              className="mt-1 h-9"
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Completude globale</div>
            <div className="mt-1 flex items-center gap-2">
              <Progress value={globalRate} className="h-1.5 flex-1" />
              <span className="w-10 text-right text-sm font-semibold tabular-nums">{globalRate}%</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Lignes analysees</div>
            <div className="text-sm font-semibold tabular-nums">{totalRows.toLocaleString("fr-FR")}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">A completer</div>
            <div className="text-sm font-semibold tabular-nums">{totalIncomplete.toLocaleString("fr-FR")}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {groupedStats.map((group) => (
          <GroupCard key={group.title} title={group.title} stats={group.stats} />
        ))}
      </div>

      {!groupedStats.length && (
        <Card className="rounded-md">
          <CardContent className="p-4 text-sm text-muted-foreground">Aucune feuille ne correspond a la recherche.</CardContent>
        </Card>
      )}
    </div>
  )
}
