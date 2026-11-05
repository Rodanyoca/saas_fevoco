import type { SheetRow } from "./google-sheets"
// @ts-expect-error Explicit extension required by the Node test runner.
import { calculateStandings } from "./standings-calculation.ts"

const text = (value: unknown) => String(value ?? "").trim()
const active = (row: SheetRow) => text(row.statut) === "ACTIF"
export type StandingsInput = { events: SheetRow[]; phases: SheetRow[]; groups: SheetRow[]; units: SheetRow[]; assignments: SheetRow[]; matches: SheetRow[]; results: SheetRow[]; standings: SheetRow[]; resultTypes: SheetRow[]; unitLabels: Record<string, string> }
export function buildCompetitionStandingsView(data: StandingsInput) {
  const phases = new Map(data.phases.map(row => [text(row.id_phase_competition), row]))
  const groups = new Map(data.groups.map(row => [text(row.id_groupe), row]))
  const events = new Map(data.events.map(row => [text(row.id_epreuve_competition), row]))
  const units = new Map(data.units.map(row => [text(row.id_unite_competition), row]))
  const matches = new Map(data.matches.map(row => [text(row.id_match), row]))
  const results = new Map(data.results.map(row => [text(row.id_match), row]))
  const name = (row: SheetRow | undefined, key: string, fallback: string) => text(row?.[key]) || fallback
  const phaseName = (id: string) => name(phases.get(id), "nom_phase", `Phase inconnue (${id || "absente"})`)
  const groupName = (id: string) => id ? name(groups.get(id), "nom_groupe", `Poule inconnue (${id})`) : "Sans poule"
  const unitName = (id: string) => data.unitLabels[id] || text(units.get(id)?.id_club) || text(units.get(id)?.id_equipe_nationale_saison) || id || "Unité inconnue"
  const byPhase = new Map<string, SheetRow[]>(), byContext = new Map<string, SheetRow[]>(), matchesByContext = new Map<string, SheetRow[]>()
  const key = (phase: string, group: string) => JSON.stringify([phase, group])
  for (const row of data.assignments) { const id = text(row.id_phase_competition); if (!byPhase.has(id)) byPhase.set(id, []); byPhase.get(id)!.push(row) }
  for (const row of data.standings) { const id = key(text(row.id_phase_competition), text(row.id_groupe)); if (!byContext.has(id)) byContext.set(id, []); byContext.get(id)!.push(row) }
  for (const row of data.matches) { const id = key(text(row.id_phase_competition), text(row.id_groupe)); if (!matchesByContext.has(id)) matchesByContext.set(id, []); matchesByContext.get(id)!.push(row) }
  const qualifications = data.assignments.filter(row => text(row.id_type_affectation_phase) === "TAP002").map((row, index) => {
    const unitId = text(row.id_unite_competition), sourceId = text(row.id_phase_source), destinationId = text(row.id_phase_competition)
    const source = phases.get(sourceId), destination = phases.get(destinationId), matchId = text(row.id_match_source)
    const origins = (byPhase.get(sourceId) || []).filter(item => active(item) && text(item.id_unite_competition) === unitId)
    const sourceGroups = [...new Set(origins.map(item => groupName(text(item.id_groupe))))]
    const issues: string[] = []
    if (sourceGroups.length > 1) issues.push("Plusieurs poules d’origine à vérifier")
    if (!units.has(unitId) || !source || !destination || !origins.length) issues.push("Référence d’unité ou de phase à vérifier")
    if (source && destination && (text(source.id_epreuve_competition) !== text(destination.id_epreuve_competition) || Number(destination.numero_phase) <= Number(source.numero_phase))) issues.push("Parcours de qualification incohérent")
    const groupId = text(row.id_groupe), group = groups.get(groupId)
    if (destination && (text(destination.id_mode_phase) === "MPH001" ? !group || text(group.id_phase_competition) !== destinationId : Boolean(groupId))) issues.push("Poule de destination à vérifier")
    if (matchId && (!matches.has(matchId) || text(results.get(matchId)?.id_statut_resultat) === "STR005" || text(matches.get(matchId)?.id_phase_competition) !== sourceId || text(results.get(matchId)?.id_unite_vainqueur) !== unitId)) issues.push("Le résultat source ne confirme plus cette qualification")
    const status = !active(row) ? "Inactive" : issues.length ? "À vérifier" : "Confirmée"
    return { id: text(row.id_phase_unite) || `qualification-${index}`, unitId, unit: unitName(unitId), sourceId, source: phaseName(sourceId), sourceGroups: sourceGroups.join(" / ") || "Non renseignée", destinationId, destination: phaseName(destinationId), destinationGroup: groupName(groupId), status, issue: issues.join(" · ") }
  })
  const contexts = new Map<string, { phaseId: string; groupId: string }>()
  const add = (phaseId: string, groupId: string) => contexts.set(key(phaseId, groupId), { phaseId, groupId })
  for (const phase of data.phases) {
    const id = text(phase.id_phase_competition), children = data.groups.filter(group => text(group.id_phase_competition) === id)
    if (text(phase.id_mode_phase) === "MPH001" && children.length) children.forEach(group => add(id, text(group.id_groupe)))
    else add(id, "")
  }
  for (const row of data.standings) add(text(row.id_phase_competition), text(row.id_groupe))
  const fields = { matchs_joues: "played", victoires: "wins", defaites: "losses", sets_gagnes: "setsFor", sets_perdus: "setsAgainst", points_pour: "pointsFor", points_contre: "pointsAgainst", points_classement: "rankingPoints", rang: "rank" } as const
  const sections = [...contexts.values()].map(({ phaseId, groupId }) => {
    const phase = phases.get(phaseId), eventId = text(phase?.id_epreuve_competition), context = key(phaseId, groupId)
    const rows = (byContext.get(context) || []).slice().sort((a, b) => Number(a.rang) - Number(b.rang) || text(a.id_unite_competition).localeCompare(text(b.id_unite_competition)))
    const members = (byPhase.get(phaseId) || []).filter(row => active(row) && text(row.id_groupe) === groupId).map(row => text(row.id_unite_competition))
    const calculated = text(phase?.id_mode_phase) === "MPH001" ? calculateStandings([...new Set(members)], matchesByContext.get(context) || [], (matchesByContext.get(context) || []).flatMap(match => { const row = results.get(text(match.id_match)); return row ? [row] : [] }), data.resultTypes) : null
    const expected = new Map(calculated?.map(row => [row.unitId, row]) || [])
    const stale = calculated !== null && (rows.length !== expected.size || rows.some(row => { const item = expected.get(text(row.id_unite_competition)); return !item || Object.entries(fields).some(([field, property]) => Number(row[field]) !== item[property as keyof typeof item]) }))
    return { id: context, eventId, event: name(events.get(eventId), "nom_epreuve", eventId || "Épreuve non renseignée"), phaseId, phase: phaseName(phaseId), groupId, group: groupName(groupId), grouped: text(phase?.id_mode_phase) === "MPH001", stale, rows: rows.map((row, index): SheetRow & { id: string; unit: string; qualification: string } => ({ ...row, id: text(row.id_classement) || `${context}-${index}`, unit: unitName(text(row.id_unite_competition)), qualification: qualifications.filter(item => item.unitId === text(row.id_unite_competition) && item.sourceId === phaseId && item.status !== "Inactive").map(item => `${item.status} · ${item.destination}`).join(" / ") || "Non qualifiée" })) }
  })
  return { sections, qualifications }
}
