import type { AffiliationKind, AffiliationRow } from "./affiliations-domain"

export type AffiliationOption = { id: string; label: string }
export type AffiliationReferences = {
  clubs: AffiliationOption[]; statuses: AffiliationOption[]; functions: AffiliationOption[]
  entityTypes: AffiliationOption[]; entities: Record<string, AffiliationOption[]>; seasons: AffiliationOption[]
}
export type ActorAffiliationView = AffiliationRow & { structure: string; entityType: string; fonction: string; statut: string; saison: string; anomaly: string; actorName?: string }
export const affiliationSheets = {
  athlete: { sheet: "ATHLETE_AFFILIATIONS", id: "id_affiliation_athlete", actorSheet: "ATHLETES", actor: "id_athlete", prefix: "AFA" },
  coach: { sheet: "COACH_AFFILIATIONS", id: "id_affiliation_coach", actorSheet: "COACHS", actor: "id_coach", prefix: "AFC" },
  medecin: { sheet: "MEDECIN_AFFILIATIONS", id: "id_affiliation_medecin", actorSheet: "MEDECINS", actor: "id_medecin", prefix: "AFM" },
  officiel: { sheet: "OFFICIELS_AFFILIATIONS", id: "id_affiliation_officiel", actorSheet: "OFFICIELS", actor: "id_officiel", prefix: "AFO" },
  autre: { sheet: "AUTRES_AFFILIATIONS", id: "id_affiliation", actorSheet: "AUTRES", actor: "id_autre_acteur", prefix: "AFU" },
} as const
export const isAffiliationKind = (value: string): value is AffiliationKind => Object.hasOwn(affiliationSheets, value)
export const usesEntity = (kind: AffiliationKind) => kind === "officiel" || kind === "autre"
export const isOfficialFederation = (kind: AffiliationKind, typeId: string, types: AffiliationOption[]) =>
  kind === "officiel" && types.some(item => item.id === typeId && item.label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase() === "FEDERATION")
type Row = Record<string, unknown>
const text = (value: unknown) => String(value ?? "").trim()

export function readAffiliationRow(kind: AffiliationKind, row: Row, statuses: AffiliationOption[], canonicalDate: (value: string) => string): AffiliationRow {
  const config = affiliationSheets[kind]
  const status = text(row.id_statut_affiliation || row.statut_affiliation)
  const statusId = statuses.find(item => item.id === status || item.label.toUpperCase() === status.toUpperCase())?.id || status
  const date = (value: unknown) => { try { return canonicalDate(text(value)) } catch { return text(value) } }
  return { id: text(row[config.id]), kind, actorId: text(row[config.actor]), clubId: text(row.id_club), entityTypeId: text(row.id_type_entite), entityId: text(row.id_entite), functionId: text(row.id_fonction), dateDebut: date(row.date_debut), dateFin: date(row.date_fin), statusId, seasonId: text(row.id_saison), observations: text(row.observations) }
}

export function writeAffiliationRow(row: AffiliationRow, statusLabel: string): Record<string, string> {
  const config = affiliationSheets[row.kind]
  return {
    [config.id]: row.id, [config.actor]: row.actorId, date_debut: row.dateDebut, date_fin: row.dateFin, observations: row.observations,
    ...(row.kind === "autre" ? { statut_affiliation: statusLabel, id_saison: row.seasonId || "" } : { id_statut_affiliation: row.statusId }),
    ...(usesEntity(row.kind) ? { id_type_entite: row.entityTypeId, id_entite: row.entityId } : { id_club: row.clubId }),
    ...(row.kind === "officiel" ? { id_fonction: row.functionId } : {}),
  }
}

export function affiliationView(row: AffiliationRow, refs: AffiliationReferences): ActorAffiliationView {
  const find = (options: AffiliationOption[], id: string) => options.find(item => item.id === id)?.label || ""
  const federation = isOfficialFederation(row.kind, row.entityTypeId, refs.entityTypes)
  const structure = federation ? (find(refs.entities[row.entityTypeId] || [], row.entityId) || refs.entities[row.entityTypeId]?.[0]?.label || find(refs.entityTypes, row.entityTypeId)) : usesEntity(row.kind) ? find(refs.entities[row.entityTypeId] || [], row.entityId) : find(refs.clubs, row.clubId)
  const statut = find(refs.statuses, row.statusId)
  return { ...row, structure, entityType: find(refs.entityTypes, row.entityTypeId), fonction: find(refs.functions, row.functionId), statut: statut || "Statut inconnu", saison: find(refs.seasons, row.seasonId || ""), anomaly: [!structure && "Structure introuvable", !statut && "Statut introuvable"].filter(Boolean).join(" · ") }
}
