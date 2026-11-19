import { RecordManagementError } from "@/lib/record-management-model"
import { assertRecordsAlive } from "@/lib/business-write-guard"
import "server-only"
import { createGoogleSportsStore, type SportsLease, type SportsStore } from "@/lib/sports-atomic-store"
import { SportsError, operation, hash, sportsToday, canonicalDate, type SportsSnapshot, type SportsRow, type SportsPlan } from "@/lib/sports-model"
import { normalizeInput, validateAthleteIdentity, athleteIdentityRecord } from "@/lib/athlete-identity"
import { nextActorId } from "@/lib/actor-id"
import { planAthleteTransfer } from "@/lib/athlete-transfers-domain"
import { allocateSportsLicences } from "@/lib/sports-licences-domain"
import { mapAthleteRow } from "@/lib/mappers/athletes"
import { mapAthleteLicence } from "@/lib/mappers/actor-records"
import { formatDateFromSheet } from "@/lib/compact-date"
import { env } from "@/lib/env"
import { getSheetsDataFrom } from "@/lib/google-sheets"

const identityFields = ["idNational", "idFivb", "nomComplet", "dateDeNaissance", "lieuDeNaissance", "idSexe", "nationalite", "telephone", "email", "adresse", "observations", "statut"]
const allowedFields = new Set([...identityFields, "clubId", "affiliationDate", "seasonId", "idempotencyKey"])
const active = (value: string) => ["ACTIF", "ACTIVE"].includes(value.trim().toUpperCase())
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toUpperCase()
export type RegistrationOptions = { clubs: Array<{ id: string; label: string; keywords: string }>; seasons: Array<{ id: string; label: string }>; currentSeasonId: string; operationDate: string }
export class RegistrationFailure extends SportsError {
  constructor(public state: "REJECTED" | "PARTIAL" | "UNCERTAIN", cause: SportsError, public existingAthleteId?: string) {
    super(cause.code, cause.message, cause.status, cause.fields, cause.uncertain)
  }
}

function command(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new SportsError("VALIDATION", "Formulaire invalide.", 422)
  const result: SportsRow = {}
  for (const [key, value] of Object.entries(payload)) {
    if (!allowedFields.has(key) || typeof value !== "string") throw new SportsError("CHAMP_INTERDIT", "Un champ du formulaire n'est pas autorisé.", 422, { [key]: "Champ non autorisé." })
    result[key] = value.trim()
  }
  return result
}

function validClub(s: Pick<SportsSnapshot, "clubs" | "ententes" | "ligues">, id: string) {
  const club = s.clubs.find(row => row.id_club === id)
  const entente = s.ententes?.find(row => row.id_entente === club?.id_entente)
  const ligue = s.ligues?.find(row => row.id_ligue === entente?.id_ligue)
  return club && /^\d{7}$/.test(id) && active(club.statut || "") && entente && active(entente.statut || "") && ligue && active(ligue.statut || "") ? { club, entente, ligue } : null
}
function validSeason(s: Pick<SportsSnapshot, "seasons" | "seasonStatuses">, id: string, date: string) {
  const season = s.seasons.find(row => row.id_saison === id)
  const status = s.seasonStatuses?.find(row => row.id_statut_saison === season?.id_statut_saison)
  if (!season || !status || !active(status.nom_statut_saison || status.nom_statut || "")) return null
  try { return formatDateFromSheet(season.date_debut) <= date && formatDateFromSheet(season.date_fin) >= date ? season : null } catch { return null }
}
function configuredSeason(s: Pick<SportsSnapshot, "seasons" | "seasonStatuses" | "parameters">, date: string) {
  const currentSeasonId = s.parameters.find(row => row.cle_parametre === "SAISON_COURANTE")?.valeur_parametre || ""
  if (!validSeason(s, currentSeasonId, date)) throw new SportsError("SAISON_COURANTE_INVALIDE", "La saison courante configurée n'est pas ouverte à cette date. Vérifiez SAISON_COURANTE.", 503)
  return currentSeasonId
}
export function registrationOptions(s: Pick<SportsSnapshot, "clubs" | "ententes" | "ligues" | "seasons" | "seasonStatuses" | "parameters">, date: string): RegistrationOptions {
  const currentSeasonId = configuredSeason(s, date)
  return { operationDate: date, currentSeasonId,
    seasons: s.seasons.filter(row => validSeason(s, row.id_saison, date)).map(row => ({ id: row.id_saison, label: row.nom_saison || row.id_saison })),
    clubs: s.clubs.flatMap(row => { const context = validClub(s, row.id_club); return context ? [{ id: row.id_club, label: row.nom_club || row.id_club, keywords: `${context.entente.nom_entente} ${context.ligue.nom_ligue}` }] : [] }).sort((a, b) => a.label.localeCompare(b.label, "fr")),
  }
}
export async function loadRegistrationOptions(): Promise<RegistrationOptions> {
  const [territory, refs] = await Promise.all([
    getSheetsDataFrom(env.googleSheets.territorialSpreadsheetId, ["CLUBS!A:ZZ", "ENTENTES!A:ZZ", "LIGUES!A:ZZ"]),
    getSheetsDataFrom(env.googleSheets.referentielsSpreadsheetId, ["SAISON!A:ZZ", "STATUTS_SAISON!A:ZZ", "PARAMETRES_SYSTEME!A:ZZ"]),
  ])
  const rows = (items: Array<Record<string, unknown>> = []) => items.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value ?? "").trim()])))
  return registrationOptions({ clubs: rows(territory.CLUBS), ententes: rows(territory.ENTENTES), ligues: rows(territory.LIGUES), seasons: rows(refs.SAISON), seasonStatuses: rows(refs.STATUTS_SAISON), parameters: rows(refs.PARAMETRES_SYSTEME) }, sportsToday())
}

function identityClaims(row: SportsRow) {
  const signatures = [`name:${normalize(row.nom_complet)}:${row.date_de_naissance}:${row.id_sexe}`]
  if (row.id_national) signatures.push(`national:${normalize(row.id_national)}`)
  if (row.id_fivb) signatures.push(`fivb:${normalize(row.id_fivb)}`)
  return signatures.map(value => `identity:${hash(value)}`)
}
function duplicate(s: SportsSnapshot, row: SportsRow) {
  return s.athletes.find(other => {
    if (row.id_national && normalize(other.id_national || "") === normalize(row.id_national)) return true
    if (row.id_fivb && normalize(other.id_fivb || "") === normalize(row.id_fivb)) return true
    if (normalize(other.nom_complet || "") !== normalize(row.nom_complet) || other.id_sexe !== row.id_sexe) return false
    if (!row.date_de_naissance || !other.date_de_naissance) return true
    try { return formatDateFromSheet(other.date_de_naissance) === row.date_de_naissance } catch { return false }
  })
}

export async function runAthleteRegistration(store: SportsStore, userId: string, payload: unknown, today = sportsToday()) {
  if (!userId) throw new SportsError("SESSION_REQUISE", "Session requise.", 401)
  const input = command(payload)
  const { idempotencyKey, ...values } = input
  const op = operation(idempotencyKey, { purpose: "athlete-registration-v1", userId, values })
  const intent = `onboarding:${op.id}`
  let started = false, identity: SportsRow | undefined, affiliation: SportsRow | undefined, licence: SportsRow | undefined
  const leases: SportsLease[] = []
  try {
    const [identityReceipt, affiliationReceipt, licenceReceipt] = await Promise.all([store.receipt("actors", op), store.receipt("affiliations", op), store.receipt("licences", op)])
    let snapshot = await store.load(true)
    const receiptRow = (ids: string[] | undefined, rows: SportsRow[], key: string) => {
      if (!ids) return undefined
      const table = key === "id_athlete" ? "ATHLETES" : key === "id_licence" ? "ATHLETE_LICENCES" : "ATHLETE_AFFILIATIONS"
      if (snapshot.deletedRecords?.[table]?.includes(ids[0])) throw new SportsError("SUPPRESSION_VOLONTAIRE", "Un ?l?ment a ?t? supprim? volontairement ; cette cr?ation ne peut pas ?tre rejou?e.", 410)
      const row = rows.find(item => item[key] === ids[0])
      if (!row) throw new SportsError("RESULTAT_INCOHERENT", "Une étape confirmée est absente des données. Une vérification est nécessaire.", 503, {}, true)
      return row
    }
    identity = receiptRow(identityReceipt?.ids, snapshot.athletes, "id_athlete")
    affiliation = receiptRow(affiliationReceipt?.ids, snapshot.affiliations, "id_affiliation_athlete")
    licence = receiptRow(licenceReceipt?.ids, snapshot.licences, "id_licence")
    const result = () => {
      if (!identity || !affiliation || !licence) throw new SportsError("PARCOURS_INCOMPLET", "Parcours incomplet.", 503)
      const club = snapshot.clubs.find(row => row.id_club === affiliation!.id_club)
      const season = snapshot.seasons.find(row => row.id_saison === licence!.id_saison)
      const sex = snapshot.sexes?.find(row => row.id_sexe === identity!.id_sexe)
      return { state: "COMPLETE" as const, athlete: mapAthleteRow({ ...identity, nom_sexe: sex?.nom_sexe || identity.id_sexe, id_club: club?.id_club || affiliation.id_club, nom_club: club?.nom_club || "" }), affiliation: { id: affiliation.id_affiliation_athlete, athleteId: identity.id_athlete, clubId: affiliation.id_club }, licence: mapAthleteLicence(licence, season), season: { id: licence.id_saison, label: season?.nom_saison || licence.id_saison }, numeroLicence: licence.numero_licence }
    }
    await assertRecordsAlive([{ table: "ATHLETES", rows: identity ? [identity] : [] }, { table: "ATHLETE_AFFILIATIONS", rows: affiliation ? [affiliation] : [] }, { table: "ATHLETE_LICENCES", rows: licence ? [licence] : [] }])
    if (identity && affiliation && licence) {
      await store.recoverCompleted([intent, identity.id_athlete], op)
      return result()
    }
    let date = identityReceipt?.operationDate || today
    const identityInput = normalizeInput(values)
    try { validateAthleteIdentity(identityInput, (snapshot.sexes || []).map(row => ({ id: row.id_sexe, nom: row.nom_sexe }))) }
    catch (error) { throw new SportsError("IDENTITE_INVALIDE", error instanceof Error ? error.message : "Identité invalide.", 422) }
    const prepare = () => {
      if (!identity) configuredSeason(snapshot, date)
      if (!validClub(snapshot, input.clubId)) throw new SportsError("CLUB_INTERDIT", "Sélectionnez un club actif de la hiérarchie territoriale autorisée.", 422, { clubId: "Club invalide ou inactif." })
      if (!validSeason(snapshot, input.seasonId, date)) throw new SportsError("SAISON_INTERDITE", "La saison choisie n'est pas ouverte à la date de délivrance.", 422, { seasonId: "Saison non admissible." })
      if (!snapshot.affiliationStatuses?.some(row => row.id_statut_affiliation === "SAF001") || !snapshot.transferTypes.some(row => row.id_type_transfert === "TRF001") || !snapshot.licenceStatuses.some(row => row.id_statut_licence === "STL001")) throw new SportsError("REFERENTIEL_INCOMPLET", "Les codes de première affiliation ou de licence active sont absents.", 503)
      const ids = [...snapshot.athletes.map(row => row.id_athlete), ...(snapshot.reservedRecordIds?.ATHLETES || [])]
      const row = identity || athleteIdentityRecord(identityInput, nextActorId(ids, "ATH"))
      if (!identity) {
        const existing = duplicate(snapshot, row)
        if (existing) throw new RegistrationFailure("REJECTED", new SportsError("DOUBLON_POTENTIEL", "Une fiche potentiellement identique existe déjà. Consultez-la avant de poursuivre.", 409), existing.id_athlete)
      }
      const firstDate = canonicalDate(input.affiliationDate, "affiliationDate")
      if (firstDate > date) throw new SportsError("AFFILIATION_FUTURE", "La première affiliation doit être effective à la délivrance.", 422, { affiliationDate: "Date postérieure à la délivrance." })
      const withIdentity = { ...snapshot, athletes: [...snapshot.athletes.filter(item => item.id_athlete !== row.id_athlete), row] }
      const identityPlan: SportsPlan = { book: "actors", table: "ATHLETES", inserts: { ATHLETES: [row] }, updates: [], claims: [`record:ATHLETES:${row.id_athlete}`, ...identityClaims(row)], resultIds: [row.id_athlete], operationDate: date }
      const affiliationPlan = affiliation ? null : planAthleteTransfer(withIdentity, row.id_athlete, { id_club: input.clubId, date_debut: firstDate, date_fin: "", id_statut_affiliation: "SAF001", id_type_transfert: "TRF001", id_affiliation_precedente: "", observations: "" }, date)
      const aff = affiliation || affiliationPlan!.inserts.ATHLETE_AFFILIATIONS[0]
      const licencePlan = licence ? null : allocateSportsLicences({ ...withIdentity, affiliations: [...snapshot.affiliations.filter(item => item.id_affiliation_athlete !== aff.id_affiliation_athlete), aff] }, { id_athlete: row.id_athlete, id_affiliation_athlete: aff.id_affiliation_athlete, id_saison: input.seasonId, date_delivrance: date, id_statut_licence: "STL001" })
      store.validatePlans([...(identity ? [] : [identityPlan]), ...(affiliationPlan ? [affiliationPlan] : []), ...(licencePlan ? [licencePlan] : [])])
      return { identityPlan, affiliationPlan, licencePlan }
    }
    let plans = prepare() // All feasible business and schema checks before even reserving the operation.
    leases.push(await store.acquire([intent], op, true))
    const commit = async (stage: "identity" | "affiliation" | "licence") => {
      for (let attempt = 0; attempt < 3; attempt++) {
        const plan = stage === "identity" ? plans.identityPlan : stage === "affiliation" ? plans.affiliationPlan : plans.licencePlan
        if (!plan) throw new SportsError("ETAPE_INCOHERENTE", "Étape déjà traitée.", 503)
        plan.audit = { userId, action: `ATHLETE_REGISTRATION_${stage.toUpperCase()}`, at: new Date().toISOString() }
        try { started = true; return (await store.commit(op, plan))[0] }
        catch (error) {
          if (!(error instanceof SportsError) || error.code !== "RESERVATION_EXISTANTE" || attempt === 2) throw error
          snapshot = await store.load(true)
          const existing = await store.completed(plan.book, op)
          if (existing) return existing[0]
          plans = prepare()
        }
      }
      throw new SportsError("CONCURRENCE", "Reprenez la même opération après actualisation.")
    }
    if (!identity) identity = await commit("identity")
    const confirmedDate = (await store.receipt("actors", op))?.operationDate || date
    if (confirmedDate !== date || identity.id_athlete !== plans.identityPlan.resultIds[0]) { date = confirmedDate; plans = prepare() }
    leases.push(await store.acquire([identity.id_athlete], op, true))
    if (!affiliation) affiliation = await commit("affiliation")
    if (plans.affiliationPlan && affiliation.id_affiliation_athlete !== plans.affiliationPlan.resultIds[0]) plans = prepare()
    if (!licence) licence = await commit("licence")
    await store.release({ owner: JSON.stringify(op), items: leases.flatMap(lease => lease.items) })
    return result()
  } catch (error) {
    if (error instanceof RegistrationFailure) {
      if (!identity && !error.uncertain) for (const lease of leases) await store.release(lease).catch(() => undefined)
      throw error
    }
    const cause = error instanceof RecordManagementError ? new SportsError(error.code, error.message, error.status, {}, error.uncertain) : error instanceof SportsError ? error : new SportsError("SOURCE_INDISPONIBLE", "Enregistrement non confirmé. Reprenez la même tentative.", 503, {}, true)
    // No rollback. Retain ownership after any attempted business write.
    if (!started && !identity) for (const lease of leases) await store.release(lease).catch(() => undefined)
    if (cause.code === "SUPPRESSION_VOLONTAIRE") throw new RegistrationFailure("REJECTED", cause)
    throw new RegistrationFailure(identity ? "PARTIAL" : started || cause.uncertain ? "UNCERTAIN" : "REJECTED", cause)
  }
}

export const registerAthlete = (userId: string, payload: unknown) => runAthleteRegistration(createGoogleSportsStore(), userId, payload)
