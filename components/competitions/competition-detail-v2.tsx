import Link from "next/link"
import { ArrowLeft, MapPin, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CompetitionEventCards } from "./competition-event-cards"
import { CompetitionMatchCards, CompetitionResultCards } from "./competition-play-cards"
import { Header } from "@/components/dashboard/header"
import { DetailCard } from "@/components/dashboard/detail-card"
import type { Option } from "@/lib/competitions-v2"
import type { SheetRow } from "@/lib/google-sheets"
import { CompetitionPhasePanel } from "./competition-phase-panel"
import { CompetitionEntryManager } from "@/components/competitions/competition-entry-manager"
import { CompetitionMatchManager } from "@/components/competitions/competition-match-manager"
import { CompetitionPeopleManager } from "@/components/competitions/competition-people-manager"
import type { CompetitionPersonOption } from "@/lib/competition-people"
import { CompetitionResultManager } from "@/components/competitions/competition-result-manager"
import { CompetitionStandingsManager } from "@/components/competitions/competition-standings-manager"
import { CompetitionDistinctionManager } from "@/components/competitions/competition-distinction-manager"
import { CompetitionCloseAction } from "@/components/competitions/competition-close-action"
import { CompetitionEditSheet } from "@/components/competitions/competition-edit-sheet"

const tabs = [
  ["general", "Général"], ["epreuves", "Épreuves"], ["structure", "Phases"],
  ["unites", "Équipes"], ["intervenants", "Participants"], ["matchs", "Matchs"],
  ["resultats", "Résultats"], ["classements", "Classement"], ["distinctions", "Distinctions"],
] as const
const value = (row: SheetRow, key: string) => String(row[key] ?? "").trim()

export function CompetitionDetailV2({ detail, references, entryOptions, peopleOptions, distinctionTargets, activeTab }: { detail: NonNullable<ReturnType<typeof import("@/lib/competitions-v2").competitionData>>; references: Record<string, Option[]>; entryOptions: { clubLabels: Record<string, string>; athleteLabels: Record<string, string>; clubs: Array<{ id: string; label: string }>; athletes: Array<{ id: string; label: string; clubId: string; sexId: string }> }; peopleOptions: CompetitionPersonOption[]; distinctionTargets: Record<string, string>; activeTab: string }) {
  const selected = tabs.some(([id]) => id === activeTab) ? activeTab : "general"
  const base = `/competitions/${encodeURIComponent(detail.competition.id)}`
  const unitLabels = Object.fromEntries(detail.unites.map(unit => {
    const id = value(unit, "id_unite_competition"), clubId = value(unit, "id_club")
    const members = detail.intervenants.filter(person => value(person, "id_unite_competition") === id && value(person, "id_type_acteur") === "TAC001").map(person => entryOptions.athleteLabels[value(person, "id_acteur")] || value(person, "id_acteur"))
    const pair = value(unit, "id_type_unite_competition") === "TUC002"
    return [id, pair && members.length ? members.join(" / ") : entryOptions.clubLabels[clubId] || clubId || value(unit, "id_equipe_nationale_saison") || id]
  }))
  const displayReferences = { ...references,
    UNITS: Object.entries(unitLabels).map(([id, label]) => ({ id, label })),
    CLUBS: Object.entries(entryOptions.clubLabels).map(([id, label]) => ({ id, label })),
    PHASES: detail.phases.map(row => ({ id: value(row, "id_phase_competition"), label: value(row, "nom_phase") })),
    GROUPS: detail.groupes.map(row => ({ id: value(row, "id_groupe"), label: value(row, "nom_groupe") })),
  }
  const participants = detail.intervenants.map(row => ({ ...row, actor_label: peopleOptions.find(person => person.id === value(row, "id_acteur") && person.typeId === value(row, "id_type_acteur"))?.label || value(row, "id_acteur") }))
  const distinctions = detail.distinctions.map(row => ({ ...row, actor_label: peopleOptions.find(person => person.id === value(row, "id_acteur") && (!value(row, "id_type_acteur") || person.typeId === value(row, "id_type_acteur")))?.label || value(row, "id_acteur") }))
  const closed = detail.competition.statut === "TERMINEE"
  return <div className="flex flex-col"><Header title={`Édition : ${detail.competition.nom}`} subtitle={detail.competition.saison} /><main className="space-y-5 p-4 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><Button asChild variant="outline"><Link href="/competitions"><ArrowLeft className="size-4" />Retour à la liste</Link></Button>{!closed ? <CompetitionCloseAction competitionId={detail.competition.id} closed={false} /> : null}</div>
    {closed ? <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Édition clôturée : consultation historique en lecture seule.</p> : null}
    <CompetitionProgress detail={detail} closed={closed} />
    <nav className="grid h-auto w-full grid-cols-2 gap-1 rounded-md bg-muted p-1 text-muted-foreground sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9" aria-label="Sections de la compétition">{tabs.map(([id, label]) => <Link key={id} href={`${base}?tab=${id}`} className={`flex min-h-9 min-w-0 items-center justify-center rounded-md border border-transparent px-2 py-2 text-center text-sm font-medium whitespace-normal transition-[color,box-shadow] ${selected === id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{label}</Link>)}</nav>
    {selected === "general" ? <General detail={detail} references={references} /> : null}
    {selected === "epreuves" ? <CompetitionEventCards competitionId={detail.competition.id} closed={closed} events={detail.epreuves} phases={detail.phases} units={detail.unites} matches={detail.matches} references={references} /> : null}
    {selected === "structure" ? <CompetitionPhasePanel competitionId={detail.competition.id} closed={closed} references={references} events={detail.epreuves} phases={detail.phases} groups={detail.groupes} assignments={detail.phasesUnites} matches={detail.matches} /> : null}
    {selected === "unites" ? <div className="space-y-4"><CompetitionEntryManager competitionId={detail.competition.id} closed={detail.competition.statut === "TERMINEE"} events={detail.epreuves} phases={detail.phases} groups={detail.groupes} options={entryOptions} /><SimpleTable title="Unités engagées" rows={detail.unites} columns={[["id_unite_competition", "Engagement"], ["id_type_unite_competition", "Type"], ["id_club", "Club"], ["id_equipe_nationale_saison", "Équipe nationale"], ["statut", "Statut"]]} references={displayReferences} /></div> : null}
    {selected === "intervenants" ? <div className="space-y-4"><CompetitionPeopleManager unitLabels={unitLabels} competitionId={detail.competition.id} closed={detail.competition.statut === "TERMINEE"} options={peopleOptions} units={detail.unites} /><SimpleTable title="Intervenants" rows={participants} columns={[["actor_label", "Nom"], ["id_type_acteur", "Type"], ["role_participant", "Rôle"], ["id_unite_competition", "Unité"], ["statut", "Statut"]]} references={displayReferences} /></div> : null}
    {selected === "matchs" ? <div className="space-y-4"><CompetitionMatchManager competitionId={detail.competition.id} closed={closed} events={detail.epreuves} phases={detail.phases} groups={detail.groupes} units={detail.unites} phaseUnits={detail.phasesUnites} unitLabels={unitLabels} /><CompetitionMatchCards matches={detail.matches} results={detail.resultats} phases={detail.phases} groups={detail.groupes} unitLabels={unitLabels} /></div> : null}
    {selected === "resultats" ? <div className="space-y-4"><CompetitionResultManager competitionId={detail.competition.id} closed={closed} matches={detail.matches} results={detail.resultats} phases={detail.phases} events={detail.epreuves} units={detail.unites} unitLabels={unitLabels} statuses={references.STATUTS_RESULTATS ?? []} /><CompetitionResultCards matches={detail.matches} results={detail.resultats} phases={detail.phases} groups={detail.groupes} unitLabels={unitLabels} statuses={references.STATUTS_RESULTATS ?? []} /></div> : null}
    {selected === "classements" ? <div className="space-y-4"><CompetitionStandingsManager unitLabels={unitLabels} competitionId={detail.competition.id} closed={detail.competition.statut === "TERMINEE"} phases={detail.phases} groups={detail.groupes} units={detail.unites} phaseUnits={detail.phasesUnites} matches={detail.matches} /><SimpleTable title="Classements et qualifications" rows={detail.classements} columns={[["id_phase_competition", "Phase"], ["id_groupe", "Groupe"], ["rang", "Rang"], ["id_unite_competition", "Unité"], ["matchs_joues", "MJ"], ["victoires", "V"], ["defaites", "D"], ["difference_sets", "+/- sets"], ["ratio_sets", "Ratio sets"], ["ratio_points", "Ratio points"], ["points_classement", "Points"]]} references={displayReferences} /></div> : null}
    {selected === "distinctions" ? <div className="space-y-4"><CompetitionDistinctionManager unitLabels={unitLabels} competitionId={detail.competition.id} closed={detail.competition.statut === "TERMINEE"} types={references.TYPES_DISTINCTIONS ?? []} targets={distinctionTargets} events={detail.epreuves} phases={detail.phases} matches={detail.matches} units={detail.unites} people={peopleOptions} distinctions={detail.distinctions} /><SimpleTable title="Distinctions" rows={distinctions} columns={[["id_type_distinction", "Distinction"], ["actor_label", "Bénéficiaire"], ["id_unite_competition", "Unité"], ["date_attribution", "Date"], ["statut", "Statut"]]} references={displayReferences} /></div> : null}
  </main></div>
}

function General({ detail, references }: { detail: NonNullable<ReturnType<typeof import("@/lib/competitions-v2").competitionData>>; references: Record<string, Option[]> }) { const c = detail.competition; return <div className="space-y-4">{c.statut !== "TERMINEE" ? <div className="flex justify-end"><CompetitionEditSheet competition={c} references={references} /></div> : null}<div className="grid gap-5 lg:grid-cols-2"><DetailCard title="Informations générales" icon={Trophy} fields={[{ label: "Référence", value: c.id }, { label: "Nom", value: c.nom }, { label: "Type", value: c.type }, { label: "Discipline", value: c.discipline }, { label: "Saison", value: c.saison }, { label: "Statut", value: c.statut }]} /><DetailCard title="Organisation" icon={MapPin} fields={[{ label: "Début", value: c.dateDebut }, { label: "Fin", value: c.dateFin }, { label: "Pays", value: c.pays }, { label: "Lieu", value: c.lieu || "-" }, { label: "Observations", value: c.observations || "-" }]} /></div></div> }

function CompetitionProgress({ detail, closed }: { detail: NonNullable<ReturnType<typeof import("@/lib/competitions-v2").competitionData>>; closed: boolean }) {
  const steps = ["Épreuves", "Engagements", "Phases", "Matchs", "Résultats", "Qualifications", "Clôture"]
  const done = [detail.epreuves.length > 0, detail.unites.length > 0, detail.phases.length > 0, detail.matches.length > 0, detail.resultats.length > 0, detail.phasesUnites.some((row) => value(row, "id_type_affectation_phase") === "TAP002"), closed]
  const warning = !detail.epreuves.length ? "Commencez par créer une épreuve." : !detail.unites.length ? "Engagez des unités avant de programmer les matchs." : detail.phases.some((phase) => value(phase, "id_mode_phase") === "MPH001" && !detail.groupes.some((group) => value(group, "id_phase_competition") === value(phase, "id_phase_competition"))) ? "Une phase de groupes attend encore ses groupes." : ""
  return <div className="space-y-2"><div className="flex flex-wrap gap-1.5 rounded-lg border bg-muted/30 p-3 text-xs sm:text-sm">{steps.map((step, index) => <span key={step} className="inline-flex items-center gap-1.5"><span className={`rounded-full px-2.5 py-1 font-medium ${done[index] ? "bg-emerald-500/15 text-emerald-700" : "bg-background"}`}>{step}</span>{index < steps.length - 1 ? <span>→</span> : null}</span>)}</div>{warning && !closed ? <p className="text-sm text-amber-700">{warning}</p> : null}</div>
}

function SimpleTable({ title, rows, columns, references }: { title: string; rows: SheetRow[]; columns: Array<[string, string]>; references: Record<string, Option[]> }) {
  const refByField: Record<string, string> = { id_unite_competition: "UNITS", id_club: "CLUBS", id_phase_competition: "PHASES", id_groupe: "GROUPS", id_discipline: "DISCIPLINES", id_categorie_age: "CATEGORIES_AGE", id_sexe: "SEXES", id_type_phase: "TYPES_PHASES", id_mode_phase: "MODES_PHASES", id_type_unite_competition: "TYPES_UNITES_COMPETITION", id_type_acteur: "TYPES_ACTEURS", id_type_distinction: "TYPES_DISTINCTIONS" }
  const display = (row: SheetRow, key: string) => { const raw = value(row, key); const sheet = refByField[key]; return sheet ? (references[sheet]?.find((option) => option.id === raw)?.label ?? raw ?? "—") || "—" : raw || "—" }
  return <section className="overflow-hidden rounded-xl border bg-card"><div className="border-b px-4 py-3"><h2 className="font-semibold">{title}</h2></div><div className="hidden overflow-x-auto md:block"><Table><TableHeader><TableRow>{columns.map(([key, label]) => <TableHead key={key}>{label}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.map((row, index) => <TableRow key={`${value(row, Object.keys(row)[0])}-${index}`}>{columns.map(([key]) => <TableCell key={key}>{key.includes("statut") ? <Badge variant="outline">{display(row, key)}</Badge> : display(row, key)}</TableCell>)}</TableRow>)}{!rows.length ? <TableRow><TableCell colSpan={columns.length} className="h-28 text-center text-muted-foreground">Aucune donnée enregistrée.</TableCell></TableRow> : null}</TableBody></Table></div><div className="divide-y md:hidden">{rows.map((row, index) => <article key={index} className="grid grid-cols-2 gap-3 p-4 text-sm">{columns.map(([key, label]) => <div key={key} className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="break-words">{display(row, key)}</p></div>)}</article>)}{!rows.length && <p className="p-6 text-center text-sm text-muted-foreground">Aucune donnée enregistrée.</p>}</div></section>
}
