// @ts-expect-error Node's TypeScript runner requires explicit extensions.
import { formatDateFromSheet } from "./compact-date.ts"
// @ts-expect-error Node's TypeScript runner requires explicit extensions.
import { effectiveLicenceStatus } from "./licences-domain.ts"

type Row = Record<string, unknown>
export type LicenceOption = { id: string; label: string }
export type ActorLicenceView = {
  id: string; actorId: string; acteur: string; type: string; numero: string; cycle: string;
  affiliation: string; affiliationId: string; periode: string; statut: string; statutEffectif: string;
  typeId: string; cycleId: string; statusId: string; dateDelivrance: string; dateDebut: string;
  dateExpiration: string; remainingDays: number | null; observations: string
}
export type ActorLicenceReferences = {
  types: LicenceOption[]; cycles: LicenceOption[]; statuses: LicenceOption[];
  actors: (LicenceOption & { typeId: string; status: string })[];
  affiliations: (LicenceOption & { typeId: string; actorId: string; dateDebut: string; dateFin: string; statusId: string; status: string; targetExists: boolean })[]
}
export type ActorLicenceSources = {
  licences: Row[]; actors: Record<string, Row[]>; affiliations: Record<string, Row[]>;
  structures: Record<string, Row[]>; refs: Record<string, Row[]>
}
export const actorLicenceKinds = {
  TAC002: { kind: "coach", sheet: "COACHS", actorKey: "id_coach", affiliationSheet: "COACH_AFFILIATIONS", affiliationKey: "id_affiliation_coach" },
  TAC003: { kind: "officiel", sheet: "OFFICIELS", actorKey: "id_officiel", affiliationSheet: "OFFICIELS_AFFILIATIONS", affiliationKey: "id_affiliation_officiel" },
  TAC004: { kind: "arbitre", sheet: "ARBITRES", actorKey: "id_arbitre", affiliationSheet: "", affiliationKey: "" },
  TAC005: { kind: "medecin", sheet: "MEDECINS", actorKey: "id_medecin", affiliationSheet: "MEDECIN_AFFILIATIONS", affiliationKey: "id_affiliation_medecin" },
} as const
export const licenceText = (value: unknown) => String(value ?? "").trim()
const options = (rows: Row[] = [], id: string, name: string) => rows.map(row => ({ id: licenceText(row[id]), label: licenceText(row[name]) || licenceText(row[id]) })).filter(row => row.id)
export function licenceReadDate(value: unknown): string {
  try { return formatDateFromSheet(licenceText(value)) } catch { return "" }
}
export function buildActorLicenceData(data: ActorLicenceSources, today: string) {
  const refs: ActorLicenceReferences = {
    types: options(data.refs.TYPES_ACTEURS, "id_type_acteur", "nom_type_acteur").filter(row => Object.hasOwn(actorLicenceKinds, row.id)),
    cycles: options(data.refs.CYCLES_LICENCES, "id_cycle_licence", "nom_cycle_licence"),
    statuses: options(data.refs.STATUT_LICENCE, "id_statut_licence", "nom_statut_licence"), actors: [], affiliations: [],
  }
  const label = (items: LicenceOption[], id: string) => items.find(item => item.id === id)?.label || id || "—"
  const clubs = new Map((data.structures.CLUBS || []).map(row => [licenceText(row.id_club), licenceText(row.nom_club)]))
  const entityTypes = new Map((data.refs.TYPES_STRUCTURES || []).map(row => [licenceText(row.id_type_structure), licenceText(row.nom_type_structure).toUpperCase()]))
  for (const [typeId, config] of Object.entries(actorLicenceKinds)) {
    refs.actors.push(...(data.actors[config.sheet] || []).map(row => ({ id: licenceText(row[config.actorKey]), label: licenceText(row.nom_complet) || licenceText(row[config.actorKey]), typeId, status: licenceText(row.statut) })).filter(row => row.id))
    for (const row of data.affiliations[config.affiliationSheet] || []) {
      const id = licenceText(row[config.affiliationKey]), actorId = licenceText(row[config.actorKey])
      if (!id || !actorId) continue
      const entityType = config.kind === "officiel" ? entityTypes.get(licenceText(row.id_type_entite)) : "CLUB"
      const entityId = licenceText(config.kind === "officiel" ? row.id_entite : row.id_club)
      const structure = entityType === "CLUB" ? clubs.get(entityId) : ["LIGUE", "ENTENTE", "FEDERATION"].includes(entityType || "") ? (data.structures[entityType === "LIGUE" ? "LIGUES" : entityType === "ENTENTE" ? "ENTENTES" : "FEDERATION"] || []).find(item => licenceText(item[entityType === "LIGUE" ? "id_ligue" : entityType === "ENTENTE" ? "id_entente" : "id_federation"]) === entityId) : undefined
      const structureLabel = typeof structure === "string" ? structure : structure ? licenceText(structure.nom_ligue || structure.nom_entente || structure.nom_officiel) : ""
      const statusId = licenceText(row.id_statut_affiliation), status = (data.refs.STATUTS_AFFILIATION || []).find(item => licenceText(item.id_statut_affiliation) === statusId)
      refs.affiliations.push({ id, actorId, typeId, label: `${structureLabel || entityId || "Structure introuvable"} · ${id}`, dateDebut: licenceReadDate(row.date_debut), dateFin: licenceText(row.date_fin) ? licenceReadDate(row.date_fin) || "0000-01-01" : "", statusId, status: licenceText(status?.nom_statut_affiliation) || statusId, targetExists: Boolean(structure) })
    }
  }
  const rows: ActorLicenceView[] = data.licences.filter(row => licenceText(row.id_licence)).map(row => {
    const typeId = licenceText(row.id_type_acteur), actorId = licenceText(row.id_acteur), cycleId = licenceText(row.id_cycle_licence), statusId = licenceText(row.id_statut_licence), affiliationId = licenceText(row.id_affiliation_acteur)
    const dateDebut = licenceReadDate(row.date_debut_validite), dateExpiration = licenceReadDate(row.date_fin_validite), statut = label(refs.statuses, statusId)
    const validDates = Boolean(dateDebut && dateExpiration && dateDebut <= dateExpiration)
    return { id: licenceText(row.id_licence), actorId, acteur: refs.actors.find(item => item.typeId === typeId && item.id === actorId)?.label || actorId, typeId, type: label(refs.types, typeId), numero: licenceText(row.numero_licence) || "—", cycleId, cycle: label(refs.cycles, cycleId), affiliationId, affiliation: typeId === "TAC004" ? "Non applicable" : refs.affiliations.find(item => item.id === affiliationId && item.typeId === typeId && item.actorId === actorId)?.label || "Affiliation historique non renseignée", dateDebut, dateExpiration, dateDelivrance: licenceReadDate(row.date_delivrance), periode: `${dateDebut || "—"} — ${dateExpiration || "—"}`, statusId, statut, statutEffectif: validDates ? effectiveLicenceStatus(statut, dateDebut, dateExpiration, today) : "DATES_INVALIDES", remainingDays: dateExpiration ? Math.round((Date.parse(dateExpiration) - Date.parse(today)) / 86400000) : null, observations: licenceText(row.observations) }
  })
  return { rows, references: refs }
}
