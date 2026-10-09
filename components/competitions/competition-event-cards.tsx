import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CompetitionStructureManager } from "./competition-structure-manager"
import type { Option } from "@/lib/competitions-v2"
import type { SheetRow } from "@/lib/google-sheets"

const text = (value: unknown) => String(value ?? "").trim()
export function CompetitionEventCards({ competitionId, closed, events, phases, units, matches, references }: {
  competitionId: string; closed: boolean; events: SheetRow[]; phases: SheetRow[]; units: SheetRow[]; matches: SheetRow[]; references: Record<string, Option[]>
}) {
  const label = (sheet: string, id: unknown) => references[sheet]?.find(item => item.id === text(id))?.label || text(id) || "—"
  return <div className="space-y-4">
    {!closed && <CompetitionStructureManager competitionId={competitionId} closed={closed} events={events} phases={phases} references={references} mode="events" />}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{events.map(event => {
      const id = text(event.id_epreuve_competition), eventPhases = phases.filter(phase => text(phase.id_epreuve_competition) === id)
      const phaseIds = new Set(eventPhases.map(phase => text(phase.id_phase_competition)))
      return <Card key={id}><CardHeader className="flex flex-row items-start justify-between gap-3"><CardTitle className="min-w-0 break-words">{text(event.nom_epreuve)}</CardTitle>{!closed && <CompetitionStructureManager competitionId={competitionId} closed={closed} events={events} phases={phases} references={references} editingEvent={event} mode="events" />}</CardHeader><CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{label("DISCIPLINES", event.id_discipline)} · {label("CATEGORIES_AGE", event.id_categorie_age)} · {label("SEXES", event.id_sexe)}</p>
        <p className="text-sm font-medium">{text(event.statut)}</p>
        <div className="grid grid-cols-3 gap-2 border-t pt-3 text-center text-xs"><span><strong className="block text-base">{units.filter(unit => text(unit.id_epreuve_competition) === id).length}</strong>Unités</span><span><strong className="block text-base">{eventPhases.length}</strong>Phases</span><span><strong className="block text-base">{matches.filter(match => phaseIds.has(text(match.id_phase_competition))).length}</strong>Matchs</span></div>
      </CardContent></Card>
    })}</div>
    {!events.length && <p className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">{closed ? "Aucune épreuve enregistrée." : "Commencez par créer une épreuve."}</p>}
  </div>
}
