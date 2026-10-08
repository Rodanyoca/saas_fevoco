import { z } from "zod"
// @ts-expect-error Node's transform-types runner requires an explicit TypeScript extension.
import { formatDateForSheet } from "./compact-date.ts"

type LicenceSource = { athleteLicences: Record<string, string>[]; actorLicences: Record<string, string>[] }
type AffiliationSnapshot = { id: string; actorId: string; activeFrom: string; activeUntil: string; statusId: string; targetExists: boolean; clubId?: string }
export type LicenceStore = {
  load(fresh?: boolean): Promise<LicenceSource>
  appendAthlete(rows: Record<string, string>[]): Promise<void>; appendActor(row: Record<string, string>): Promise<void>
  updateAthlete?(id: string, row: Record<string, string>): Promise<void>
  updateActor?(id: string, row: Record<string, string>): Promise<void>
  athleteExists(id: string): Promise<boolean>; actorExists(typeId: string, id: string): Promise<boolean>
  seasonExists(id: string): Promise<boolean>; cycleExists(id: string): Promise<boolean>; statusExists(id: string): Promise<boolean>
  affiliation(kind: "athlete" | "coach" | "officiel" | "medecin", id: string): Promise<AffiliationSnapshot | null>
}
export class LicenceDomainError extends Error { code: string; status: number; fields: Record<string, string>; constructor(code: string, message: string, status: number, fields: Record<string, string> = {}) { super(message); this.code = code; this.status = status; this.fields = fields } }
const actorKinds: Record<string, "coach" | "officiel" | "arbitre" | "medecin"> = { TAC002: "coach", TAC003: "officiel", TAC004: "arbitre", TAC005: "medecin" }
const date = (value: string) => { const result = formatDateForSheet(value); if (!result) throw new Error(); return result }
const active = (a: AffiliationSnapshot, on: string) => a.statusId === "SAF001" && a.activeFrom <= on && (!a.activeUntil || a.activeUntil >= on) && a.targetExists
const next = (prefix: string, year: string, rows: Record<string, string>[]) => `${prefix}-${year}-${String(Math.max(0, ...rows.map((r) => +(r.id_licence?.match(new RegExp(`^${prefix}-${year}-(\\d{6})$`))?.[1] || 0))) + 1).padStart(6, "0")}`
const text = z.string().trim()
const athleteSchema = z.object({ id_athlete: text.min(1), id_saison: text.min(1), id_affiliation_athlete: text.min(1), numero_licence: text.min(1), date_delivrance: text.min(1), id_statut_licence: text.min(1), observations: text.optional().default("") })
const actorSchema = z.object({ id_type_acteur: text.min(1), id_acteur: text.min(1), id_affiliation_acteur: text.optional().default(""), id_cycle_licence: text.min(1), numero_licence: text.min(1), date_delivrance: text.min(1), date_debut_validite: text.min(1), date_fin_validite: text.min(1), id_statut_licence: text.min(1), observations: text.optional().default("") })

export function effectiveLicenceStatus(status: string, start: string, end: string, today: string) { const normalized = status.normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase(); if (!["ACTIVE", "ACTIF"].includes(normalized)) return normalized || "NON_DEFINI"; if (start > today) return "A_VENIR"; if (end && end < today) return "EXPIREE"; return "VALIDE" }

function parsed<T>(schema: z.ZodType<T>, input: unknown): T { const result = schema.safeParse(input); if (!result.success) throw new LicenceDomainError("VALIDATION", "Veuillez corriger les champs indiqués.", 422, Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message]))); return result.data }

export function createLicenceDomain(store: LicenceStore) {
  return {
    async updateActor(id: string, input: unknown) {
      const source = await store.load(true), current = source.actorLicences.find(row => row.id_licence === id)
      if (!current) throw new LicenceDomainError("LICENCE_INTROUVABLE", "Licence introuvable.", 404)
      const fields = parsed(actorSchema.omit({ id_type_acteur: true, id_acteur: true }), input)
      const memory: LicenceStore = { ...store, load: async () => ({ ...source, actorLicences: source.actorLicences.filter(row => row.id_licence !== id) }), appendActor: async () => {} }
      const validated = await createLicenceDomain(memory).createActor({ ...fields, id_type_acteur: current.id_type_acteur, id_acteur: current.id_acteur })
      const row = { ...current, ...validated, id_licence: id }
      if (!store.updateActor) throw new Error("Modification indisponible.")
      await store.updateActor(id, row)
      return row
    },
    async transitionActor(id: string, action: string, today: string) {
      const source = await store.load(true), current = source.actorLicences.find(row => row.id_licence === id)
      if (!current) throw new LicenceDomainError("LICENCE_INTROUVABLE", "Licence introuvable.", 404)
      const state = current.id_statut_licence
      const target = ({ suspend: "STL003", reactivate: "STL001", close: "STL004", cancel: "STL005" } as Record<string, string>)[action]
      const permitted = action === "cancel" ? state !== "STL005" : action === "reactivate" ? state === "STL003" : action === "suspend" ? state === "STL001" : action === "close" && ["STL001", "STL003"].includes(state)
      if (!target || !permitted || (action !== "cancel" && current.date_fin_validite < today)) throw new LicenceDomainError("TRANSITION_INTERDITE", "Cette action n’est pas applicable à la licence.", 409)
      if (!(await store.statusExists(target))) throw new LicenceDomainError("STATUT_INVALIDE", "Statut inconnu.", 422)
      if (action === "reactivate" && source.actorLicences.some(row => row.id_licence !== id && row.id_type_acteur === current.id_type_acteur && row.id_acteur === current.id_acteur && row.id_statut_licence !== "STL005" && current.date_debut_validite <= row.date_fin_validite && current.date_fin_validite >= row.date_debut_validite)) throw new LicenceDomainError("CHEVAUCHEMENT", "Cette période chevauche une licence existante.", 409)
      if (!store.updateActor) throw new Error("Modification indisponible.")
      const row = { ...current, id_statut_licence: target, date_delivrance: safeDate(current.date_delivrance, "date_delivrance"), date_debut_validite: safeDate(current.date_debut_validite, "date_debut_validite"), date_fin_validite: safeDate(current.date_fin_validite, "date_fin_validite") }
      await store.updateActor(id, row)
      return row
    },
    async updateAthlete(id: string, input: unknown) {
      const data = await store.load(true), current = data.athleteLicences.find(row => row.id_licence === id)
      if (!current) throw new LicenceDomainError("LICENCE_INTROUVABLE", "Licence introuvable.", 404)
      const fields = parsed(athleteSchema.pick({ numero_licence: true, date_delivrance: true, id_statut_licence: true, observations: true }), input)
      if (!(await store.statusExists(fields.id_statut_licence))) throw new LicenceDomainError("STATUT_INVALIDE", "Statut inconnu.", 422)
      const row: Record<string, string> = { ...current, ...fields, date_delivrance: safeDate(fields.date_delivrance, "date_delivrance") }
      if (!store.updateAthlete) throw new Error("Modification indisponible.")
      await store.updateAthlete(id, row)
      return row
    },
    async renewClub(input: unknown) {
      const v = parsed(z.object({ id_club: text.min(1), id_saison: text.min(1), id_affiliations_athletes: z.array(text.min(1)).min(1), date_delivrance: text.min(1), id_statut_licence: text.min(1), observations: text.optional().default("") }), input)
      const delivery = safeDate(v.date_delivrance, "date_delivrance"), source = await store.load(true)
      const staged: Record<string, string>[] = [], actors = new Set<string>()
      const memory: LicenceStore = { ...store, load: async () => ({ ...source, athleteLicences: [...source.athleteLicences, ...staged] }), appendAthlete: async rows => { staged.push(...rows) } }
      for (const id of v.id_affiliations_athletes) {
        const affiliation = await store.affiliation("athlete", id)
        if (!affiliation || affiliation.clubId !== v.id_club || !active(affiliation, delivery)) throw new LicenceDomainError("AFFILIATION_INADMISSIBLE", "Une affiliation active au club est requise pour le renouvellement.", 409)
        if (actors.has(affiliation.actorId)) throw new LicenceDomainError("DOUBLON", "Un athlète ne peut être sélectionné qu’une fois.", 409)
        actors.add(affiliation.actorId)
        const previous = source.athleteLicences.filter(row => row.id_athlete === affiliation.actorId && row.id_saison !== v.id_saison && row.date_delivrance <= delivery && row.numero_licence).sort((a, b) => b.date_delivrance.localeCompare(a.date_delivrance))[0]
        if (!previous) throw new LicenceDomainError("PREMIERE_LICENCE", "Enregistrez la première licence individuellement.", 409)
        await createLicenceDomain(memory).createAthlete({ ...v, id_athlete: affiliation.actorId, id_affiliation_athlete: id, numero_licence: previous.numero_licence }, delivery)
      }
      await store.appendAthlete(staged)
      return staged
    },
    async createAthlete(input: unknown, controlDate: string) {
      void controlDate
      const v = parsed(athleteSchema, input), delivery = safeDate(v.date_delivrance, "date_delivrance")
      if (!(await store.athleteExists(v.id_athlete))) throw new LicenceDomainError("ATHLETE_INTROUVABLE", "Athlète introuvable.", 404)
      if (!(await store.seasonExists(v.id_saison))) throw new LicenceDomainError("SAISON_INTROUVABLE", "Saison introuvable.", 404)
      if (!(await store.statusExists(v.id_statut_licence))) throw new LicenceDomainError("STATUT_INVALIDE", "Statut inconnu.", 422)
      const affiliation = await store.affiliation("athlete", v.id_affiliation_athlete)
      if (!affiliation || affiliation.actorId !== v.id_athlete) throw new LicenceDomainError("AFFILIATION_INADMISSIBLE", "L’affiliation n’existe pas pour cet athlète.", 409)
      const data = await store.load(true)
      if (data.athleteLicences.some((row) => row.id_athlete === v.id_athlete && row.id_saison === v.id_saison)) throw new LicenceDomainError("LICENCE_EXISTANTE", "Cet athlète possède déjà une licence pour cette saison.", 409)
      const row = { id_licence: next("VOL-LIC", delivery.slice(0, 4), data.athleteLicences), ...v, date_delivrance: delivery }
      await store.appendAthlete([row]); return row
    },
    async createActor(input: unknown) {
      const v = parsed(actorSchema, input), kind = actorKinds[v.id_type_acteur]
      if (!kind || !(await store.actorExists(v.id_type_acteur, v.id_acteur))) throw new LicenceDomainError("ACTEUR_INTROUVABLE", "Acteur introuvable pour ce type.", 404)
      if (!(await store.cycleExists(v.id_cycle_licence)) || !(await store.statusExists(v.id_statut_licence))) throw new LicenceDomainError("REFERENCE_INVALIDE", "Cycle ou statut inconnu.", 422)
      const affiliationId = v.id_affiliation_acteur ?? ""
      if (kind === "arbitre" && affiliationId) throw new LicenceDomainError("AFFILIATION_INTERDITE", "Un arbitre ne doit pas avoir d’affiliation.", 422)
      const start = safeDate(v.date_debut_validite, "date_debut_validite"), end = safeDate(v.date_fin_validite, "date_fin_validite"), delivery = safeDate(v.date_delivrance, "date_delivrance")
      if (end < start || delivery > start) throw new LicenceDomainError("DATES_INCOHERENTES", "La période de licence est invalide.", 422)
      if (kind !== "arbitre") { const affiliation = await store.affiliation(kind, affiliationId); if (!affiliation || affiliation.actorId !== v.id_acteur || !active(affiliation, start)) throw new LicenceDomainError("AFFILIATION_REQUISE", "Une affiliation active est obligatoire.", 409) }
      const data = await store.load(true)
      if (data.actorLicences.some((row) => row.id_type_acteur === v.id_type_acteur && row.id_acteur === v.id_acteur && row.id_statut_licence !== "STL005" && start <= row.date_fin_validite && end >= row.date_debut_validite)) throw new LicenceDomainError("CHEVAUCHEMENT", "Cette période chevauche une licence existante.", 409)
      const row = { id_licence: next("VOL-ACL", delivery.slice(0, 4), data.actorLicences), ...v, id_affiliation_acteur: kind === "arbitre" ? "" : affiliationId, observations: v.observations ?? "", date_delivrance: delivery, date_debut_validite: start, date_fin_validite: end }
      await store.appendActor(row); return row
    },
  }
}
function safeDate(value: string, field: string) { try { return date(value) } catch { throw new LicenceDomainError("VALIDATION", "Date invalide.", 422, { [field]: "Date invalide." }) } }
