import { z } from "zod"
// @ts-expect-error Node's transform-types runner requires an explicit TypeScript extension.
import { formatDateForSheet } from "./compact-date.ts"

export type AffiliationKind = "athlete" | "coach" | "medecin" | "officiel" | "autre"
export type AffiliationRow = {
  id: string; kind: AffiliationKind; actorId: string; clubId: string; entityTypeId: string; entityId: string
  functionId: string; dateDebut: string; dateFin: string; statusId: string; observations: string; seasonId?: string
}
export type AffiliationStore = {
  list(kind: AffiliationKind, fresh?: boolean): Promise<AffiliationRow[]>
  save(row: AffiliationRow, mode: "create" | "update"): Promise<void>
  actorExists(kind: AffiliationKind, id: string): Promise<boolean>
  clubExists(id: string): Promise<boolean>
  entityExists(typeId: string, id: string): Promise<boolean>
  statusExists(id: string): Promise<boolean>
  officialFunctionExists(id: string): Promise<boolean>
  statusLabel(id: string): Promise<string>
  seasonExists(id: string): Promise<boolean>
  generateId?(kind: AffiliationKind): string
}

export class AffiliationDomainError extends Error {
  constructor(public code: string, message: string, public status: number, public fields: Record<string, string> = {}) { super(message) }
}

const commandSchema = z.object({
  id_club: z.string().trim().optional().default(""), id_fonction: z.string().trim().optional().default(""),
  id_type_entite: z.string().trim().optional().default(""), id_entite: z.string().trim().optional().default(""),
  date_debut: z.string().trim().min(1, "Ce champ est obligatoire."), date_fin: z.string().trim().optional().default(""),
  id_statut_affiliation: z.string().trim().min(1, "Ce champ est obligatoire."), observations: z.string().trim().optional().default(""),
  id_saison: z.string().trim().optional().default(""),
})
const prefixes: Record<AffiliationKind, string> = { athlete: "AFA", coach: "AFC", medecin: "AFM", officiel: "AFO", autre: "AFU" }
const isOfficial = (kind: AffiliationKind) => kind === "officiel"
const targetsEntity = (kind: AffiliationKind) => kind === "officiel" || kind === "autre"
const overlap = (a: AffiliationRow, start: string, end: string) => a.dateDebut <= (end || "9999-12-31") && start <= (a.dateFin || "9999-12-31")
const sameTarget = (a: AffiliationRow, clubId: string, typeId: string, entityId: string) => targetsEntity(a.kind) ? a.entityTypeId === typeId && a.entityId === entityId : a.clubId === clubId

function nextId(kind: AffiliationKind, rows: AffiliationRow[]) {
  const prefix = prefixes[kind], pattern = new RegExp(`^${prefix}-(\\d{6})$`)
  const highest = Math.max(0, ...rows.map((row) => Number(row.id.match(pattern)?.[1] ?? 0)))
  return `${prefix}-${String(highest + 1).padStart(6, "0")}`
}

function parse(input: unknown) {
  const result = commandSchema.safeParse(input)
  if (!result.success) throw new AffiliationDomainError("VALIDATION", "Veuillez corriger les champs indiqués.", 422, Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message])))
  let dateDebut = "", dateFin = ""
  const fields: Record<string, string> = {}
  try { dateDebut = formatDateForSheet(result.data.date_debut) } catch { fields.date_debut = "Date invalide." }
  try { dateFin = result.data.date_fin ? formatDateForSheet(result.data.date_fin) : "" } catch { fields.date_fin = "Date invalide." }
  if (dateDebut && dateFin && dateFin < dateDebut) fields.date_fin = "La date de fin ne peut pas précéder la date de début."
  if (Object.keys(fields).length) throw new AffiliationDomainError("VALIDATION", "Veuillez corriger les champs indiqués.", 422, fields)
  return { ...result.data, date_debut: dateDebut, date_fin: dateFin }
}

export function isAffiliationActive(row: Pick<AffiliationRow, "statusId" | "dateDebut" | "dateFin">, onDate: string, activeStatusId: string) {
  return row.statusId === activeStatusId && row.dateDebut <= onDate && (!row.dateFin || row.dateFin >= onDate)
}

export function createAffiliationDomain(store: AffiliationStore) {
  async function mutate(kind: AffiliationKind, actorId: string, input: unknown, currentId?: string) {
    if (!Object.hasOwn(prefixes, kind)) throw new AffiliationDomainError("TYPE_NON_PRIS_EN_CHARGE", "Ce type d’acteur n’est pas pris en charge pour les affiliations.", 422)
    if (!actorId || !(await store.actorExists(kind, actorId))) throw new AffiliationDomainError("ACTEUR_INTROUVABLE", "Acteur introuvable.", 404, { actorId: "Acteur inconnu." })
    const values = parse(input), official = isOfficial(kind), entity = targetsEntity(kind)
    if (!entity && (!values.id_club || !(await store.clubExists(values.id_club)))) throw new AffiliationDomainError("CLUB_INTROUVABLE", "Club introuvable.", 422, { id_club: "Club inconnu." })
    if (official && !values.id_fonction) throw new AffiliationDomainError("VALIDATION", "La fonction est obligatoire.", 422, { id_fonction: "Ce champ est obligatoire." })
    if (official && !(await store.officialFunctionExists(values.id_fonction))) throw new AffiliationDomainError("FONCTION_INVALIDE", "Fonction inconnue.", 422, { id_fonction: "Valeur inconnue." })
    if (entity && (!values.id_type_entite || !values.id_entite || !(await store.entityExists(values.id_type_entite, values.id_entite)))) throw new AffiliationDomainError("ENTITE_INVALIDE", "Entité incompatible ou introuvable.", 422, { id_entite: "Entité inconnue pour ce type." })
    if (!(await store.statusExists(values.id_statut_affiliation))) throw new AffiliationDomainError("STATUT_INVALIDE", "Statut inconnu.", 422, { id_statut_affiliation: "Valeur inconnue." })
    const status = (await store.statusLabel(values.id_statut_affiliation)).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
    if (status === "TERMINE" && !values.date_fin) throw new AffiliationDomainError("VALIDATION", "La date de fin est obligatoire pour une affiliation terminée.", 422, { date_fin: "Ce champ est obligatoire." })
    if (status === "AUTRE" && !values.observations) throw new AffiliationDomainError("VALIDATION", "Précisez le statut dans les observations.", 422, { observations: "Ce champ est obligatoire." })
    if (kind === "autre" && (!values.id_saison || !(await store.seasonExists(values.id_saison)))) throw new AffiliationDomainError("SAISON_INVALIDE", "Sélectionnez une saison du référentiel.", 422, { id_saison: "Saison inconnue." })
    const rows = await store.list(kind, true), current = currentId ? rows.find((row) => row.id === currentId && row.actorId === actorId) : undefined
    if (currentId && !current) throw new AffiliationDomainError("INTROUVABLE", "Affiliation introuvable pour cet acteur.", 404)
    const candidate: AffiliationRow = { id: currentId || store.generateId?.(kind) || nextId(kind, rows), kind, actorId, clubId: entity ? "" : values.id_club, entityTypeId: entity ? values.id_type_entite : "", entityId: entity ? values.id_entite : "", functionId: official ? values.id_fonction : "", dateDebut: values.date_debut, dateFin: values.date_fin, statusId: values.id_statut_affiliation, observations: values.observations, seasonId: kind === "autre" ? values.id_saison : "" }
    const exact = rows.find((row) => row.id !== currentId && (Object.keys(candidate) as Array<keyof AffiliationRow>).filter(key => key !== "id").every(key => (row[key] || "") === (candidate[key] || "")))
    if (!currentId && exact) return { row: exact, created: false }
    if (rows.some((row) => row.id !== currentId && row.actorId === actorId && sameTarget(row, candidate.clubId, candidate.entityTypeId, candidate.entityId) && overlap(row, candidate.dateDebut, candidate.dateFin))) throw new AffiliationDomainError("CHEVAUCHEMENT", "Cette période chevauche une affiliation existante.", 409, { date_debut: "Période en conflit.", date_fin: "Période en conflit." })
    await store.save(candidate, currentId ? "update" : "create")
    return { row: candidate, created: !currentId }
  }
  return { create: (kind: AffiliationKind, actorId: string, input: unknown) => mutate(kind, actorId, input), update: (kind: AffiliationKind, actorId: string, id: string, input: unknown) => mutate(kind, actorId, input, id) }
}
