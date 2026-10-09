import { CalendarDays, Clock3, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { formatDateForDisplay } from "@/lib/compact-date"
import type { Option } from "@/lib/competitions-v2"
import type { SheetRow } from "@/lib/google-sheets"

const text = (value: unknown) => String(value ?? "").trim()
type Props = { matches: SheetRow[]; results: SheetRow[]; phases: SheetRow[]; groups: SheetRow[]; unitLabels: Record<string, string> }
function context(match: SheetRow, phases: SheetRow[], groups: SheetRow[]) {
  return { phase: text(phases.find(row => text(row.id_phase_competition) === text(match.id_phase_competition))?.nom_phase) || "Phase non renseignée", group: text(groups.find(row => text(row.id_groupe) === text(match.id_groupe))?.nom_groupe), date: formatDateForDisplay(text(match.date_match)) || "Date à préciser", time: text(match.heure_match) || "Heure à préciser" }
}
function TeamName({ name }: { name: string }) {
  return <div className="min-w-0"><div className="mx-auto mb-2 grid size-10 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">{name.slice(0, 2).toUpperCase()}</div><p className="break-words text-sm font-semibold leading-tight">{name}</p></div>
}
export function CompetitionMatchCards({ matches, results, phases, groups, unitLabels }: Props) {
  const completed = new Map(results.map(row => [text(row.id_match), text(row.id_statut_resultat)]))
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{matches.map(match => {
    const info = context(match, phases, groups), id = text(match.id_match)
    return <Card key={id} className="gap-0 overflow-hidden py-0 shadow-sm"><div className="flex items-center justify-between gap-3 border-b bg-muted/35 px-4 py-3"><div className="min-w-0"><p className="break-words text-xs font-semibold uppercase tracking-wide text-muted-foreground">{info.phase}</p>{info.group && <p className="text-sm font-medium">{info.group}</p>}</div><StatusBadge status={completed.get(id) === "STR005" ? "ANNULE" : completed.has(id) ? "JOUE" : text(match.statut_match)} /></div><CardContent className="px-4 py-5"><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center"><TeamName name={unitLabels[text(match.id_unite_a)] || text(match.id_unite_a)} /><span className="rounded-full border bg-background px-3 py-1 text-xs font-bold text-muted-foreground">VS</span><TeamName name={unitLabels[text(match.id_unite_b)] || text(match.id_unite_b)} /></div><div className="mt-5 flex flex-wrap items-center justify-center gap-5 border-t pt-4 text-sm text-muted-foreground"><span className="inline-flex items-center gap-1.5"><CalendarDays className="size-4" />{info.date}</span><span className="inline-flex items-center gap-1.5"><Clock3 className="size-4" />{info.time}</span></div></CardContent></Card>
  })}{!matches.length && <p className="rounded-lg border p-6 text-center text-muted-foreground">Aucun match programmé.</p>}</div>
}
export function CompetitionResultCards({ matches, results, phases, groups, unitLabels, statuses }: Props & { statuses: Option[] }) {
  return <div className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-3">{results.map(result => {
    const match = matches.find(row => text(row.id_match) === text(result.id_match)) || {}, info = context(match, phases, groups)
    const played = text(result.id_statut_resultat) === "STR001"
    const sets = [1, 2, 3, 4, 5].filter(set => text(result[`set_${set}_a`]) !== "" && text(result[`set_${set}_b`]) !== "")
    return <Card key={text(result.id_resultat) || text(result.id_match)} className="gap-0 overflow-hidden py-0 shadow-sm"><div className="flex items-center justify-between gap-3 border-b bg-muted/35 px-3 py-2.5"><div className="min-w-0"><p className="break-words text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{info.phase}{info.group ? ` · ${info.group}` : ""}</p><p className="text-[11px] text-muted-foreground">{info.date} · {info.time}</p></div><StatusBadge status={statuses.find(item => item.id === text(result.id_statut_resultat))?.label || text(result.id_statut_resultat)} /></div><CardContent className="px-3 py-3"><div className="space-y-2">{["a", "b"].map(side => {
      const id = text(match[`id_unite_${side}`]), name = unitLabels[id] || id || "Unité non renseignée"
      return <div key={side} className="flex min-w-0 items-center gap-2 rounded-md border bg-background px-2.5 py-2"><div className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{name.slice(0, 2).toUpperCase()}</div><span className="min-w-0 flex-1 break-words text-sm font-semibold">{name}</span>{played && text(result.id_unite_vainqueur) === id && <Trophy className="size-3.5 shrink-0 text-amber-500" />}<strong className="text-xl tabular-nums">{text(result[`sets_gagnes_${side}`]) || "—"}</strong></div>
    })}</div>{played && sets.length > 0 && <div className="mt-3 grid grid-cols-3 gap-1.5 border-t pt-3 sm:grid-cols-5">{sets.map(set => <div key={set} className="rounded-md bg-muted/45 px-1.5 py-1.5 text-center"><p className="text-[9px] font-bold uppercase text-muted-foreground">Set {set}</p><p className="text-xs font-semibold tabular-nums">{text(result[`set_${set}_a`])}–{text(result[`set_${set}_b`])}</p></div>)}</div>}</CardContent></Card>
  })}{!results.length && <p className="rounded-lg border p-6 text-center text-muted-foreground">Aucun résultat enregistré.</p>}</div>
}
