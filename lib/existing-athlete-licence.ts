import "server-only"
import { createGoogleSportsStore, type SportsStore, type SportsLease } from "@/lib/sports-atomic-store"
import { SportsError, sportsToday, operation, affiliationAt, canonicalDate, type SportsSnapshot, type SportsRow, type SportsPlan } from "@/lib/sports-model"
import { planAthleteTransfer } from "@/lib/athlete-transfers-domain"
import { allocateSportsLicences } from "@/lib/sports-licences-domain"
import { mapAthleteLicence } from "@/lib/mappers/actor-records"
import { assertRecordsAlive } from "@/lib/business-write-guard"
import { RecordManagementError } from "@/lib/record-management-model"

export type ExistingLicenceState = "READY" | "NEEDS_AFFILIATION" | "MOVEMENT_REQUIRED" | "TRANSFER_REQUIRED" | "CONFLICT" | "EXISTING" | "RESERVED"
export type ExistingLicenceActor = { id: string; name: string; state: ExistingLicenceState; clubId: string; club: string; affiliationId: string; historyCount: number; message: string; licenceNumber?: string; affiliationState: ExistingLicenceState; locked: boolean }
function licenceOptions(s: SportsSnapshot, date: string) {
  const seasons = s.seasons.map(row => ({ id: row.id_saison, label: row.nom_saison || row.id_saison }))
  const configured = s.parameters.find(row => row.cle_parametre === "SAISON_COURANTE")?.valeur_parametre
  const currentSeasonId = seasons.find(row => row.id === configured)?.id || s.seasons.find(row => row.date_debut <= date && row.date_fin >= date)?.id_saison || seasons[0]?.id || ""
  return { currentSeasonId, operationDate: date, seasons, clubs: s.clubs.filter(row => /^\d{7}$/.test(row.id_club)).map(row => ({ id: row.id_club, label: row.nom_club || row.id_club })) }
}
function contexts(s: SportsSnapshot, seasonId: string, date: string, clubId: string) {
  const histories = new Map<string, SportsRow[]>(), current = new Map<string, SportsRow[]>(), licences = new Map<string, SportsRow>()
  for (const row of s.affiliations) { const history = histories.get(row.id_athlete) || []; history.push(row); histories.set(row.id_athlete, history); if (affiliationAt(row, date)) { const rows = current.get(row.id_athlete) || []; rows.push(row); current.set(row.id_athlete, rows) } }
  for (const row of s.licences) if (row.id_saison === seasonId) licences.set(row.id_athlete, row)
  const recoverable = new Set(s.recoverableLicenceClaims?.map(claim => claim.actorSeason))
  const reserved = new Set((s.reservedAthleteSeasons || []).filter(key => !recoverable.has(key))), locked = new Set(s.operationActorIds), clubs = new Map(s.clubs.map(row => [row.id_club, row.nom_club || row.id_club]))
  return s.athletes.map(actor => {
    const id = actor.id_athlete, history = histories.get(id) || [], active = current.get(id) || [], aff = active[0], licence = licences.get(id)
    let state: ExistingLicenceState = "READY", message = "Affiliation active : le numéro sera attribué automatiquement."
    if (active.length > 1) { state = "CONFLICT"; message = "Plusieurs affiliations actives : corrigez le rattachement." }
    else if (aff && clubId && aff.id_club !== clubId) { state = "TRANSFER_REQUIRED"; message = "Un transfert est requis pour changer de club." }
    else if (!aff || aff.id_statut_affiliation !== "SAF001") {
      if (history.length) { state = "MOVEMENT_REQUIRED"; message = "Aucune affiliation active : complétez le mouvement dans l'historique." }
      else { state = "NEEDS_AFFILIATION"; message = "Une première affiliation doit être renseignée." }
    }
    const affiliationState = state
    if (licence) { state = "EXISTING"; message = "Une licence existe déjà pour cette saison." }
    else if (reserved.has(`${id}:${seasonId}`) || locked.has(id)) { state = "RESERVED"; message = "Une délivrance est déjà réservée pour cet athlète. Reprenez ou vérifiez cette opération." }

    return { affiliationState, locked: locked.has(id), id, name: actor.nom_complet || actor.nom_complet_athlete || id, state, clubId: aff?.id_club || "", club: clubs.get(aff?.id_club || "") || "", affiliationId: aff?.id_affiliation_athlete || "", historyCount: history.length, message, ...(licence ? { licenceNumber: licence.numero_licence } : {}) } satisfies ExistingLicenceActor
  })
}
export async function existingAthleteLicenceOptions(store: SportsStore, selection: { actorId?: string; clubId?: string; seasonId?: string }, date = sportsToday()) {
  const s = await store.load("licence"), options = licenceOptions(s, date), season = selection.seasonId || options.currentSeasonId
  if (!options.seasons.some(item => item.id === season)) throw new SportsError("SAISON_INTERDITE", "La saison sélectionnée n'est pas ouverte à la délivrance.", 422)
  const actors = contexts(s, season, date, selection.clubId || "").filter(actor => selection.actorId ? actor.id === selection.actorId : actor.state !== "TRANSFER_REQUIRED")
  if (selection.actorId && !actors.length) throw new SportsError("ATHLETE_INTROUVABLE", "Athlète introuvable.", 404)
  return { ...options, selectedSeasonId: season, actors,
    licences: s.licences.map(row => ({ actorId: row.id_athlete, seasonId: row.id_saison, number: row.numero_licence })),
    reservations: (s.reservedAthleteSeasons || []).filter(key => !s.recoverableLicenceClaims?.some(claim => claim.actorSeason === key)) }
}
export class ExistingLicenceFailure extends SportsError {
  constructor(public state: "REJECTED" | "PARTIAL" | "UNCERTAIN", cause: SportsError) { super(cause.code, cause.message, cause.status, cause.fields, cause.uncertain) }
}
export async function runExistingAthleteLicence(store: SportsStore, userId: string, payload: unknown, today = sportsToday()) {
  if (!userId) throw new SportsError("SESSION_REQUISE", "Session requise.", 401)
  const allowed = ["actorId", "clubId", "seasonId", "affiliationDate", "confirmAffiliation", "idempotencyKey"]
  if (!payload || typeof payload !== "object" || Array.isArray(payload) || Object.entries(payload).some(([key, value]) => !allowed.includes(key) || typeof value !== "string")) throw new SportsError("COMMANDE_INVALIDE", "Commande invalide.", 422)
  const input = Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, String(value).trim()]))
  const { idempotencyKey, ...values } = input, op = operation(idempotencyKey, { purpose: "existing-athlete-licence-v1", userId, values })
  let lease: SportsLease | undefined, started = false, createdAffiliation = false, affiliation: SportsRow | undefined, licence: SportsRow | undefined
  try {
    const [affReceipt, licReceipt] = await Promise.all([input.confirmAffiliation === "true" ? store.receipt("affiliations", op) : Promise.resolve(null), store.receipt("licences", op)])
    if (!licReceipt) lease = await store.acquire([input.actorId], op, true)
    let snapshot = await store.load("licence")
    const date = affReceipt?.operationDate || licReceipt?.operationDate || today
    const restore = (ids: string[] | undefined, table: string, rows: SportsRow[], key: string) => {
      if (!ids) return undefined
      if (snapshot.deletedRecords?.[table]?.includes(ids[0])) throw new SportsError("SUPPRESSION_VOLONTAIRE", "Un élément a été supprimé volontairement. Cette commande ne peut pas le recréer.", 410)
      const row = rows.find(item => item[key] === ids[0])
      if (!row) throw new SportsError("RESULTAT_INCOHERENT", "Un reçu existe mais sa ligne est absente. Une vérification est nécessaire.", 503, {}, true)
      return row
    }
    affiliation = restore(affReceipt?.ids, "ATHLETE_AFFILIATIONS", snapshot.affiliations, "id_affiliation_athlete")
    createdAffiliation = Boolean(affReceipt)
    licence = restore(licReceipt?.ids, "ATHLETE_LICENCES", snapshot.licences, "id_licence")
    const result = () => {
      if (!affiliation || !licence) throw new SportsError("PARCOURS_INCOMPLET", "Parcours incomplet.", 503)
      if (!snapshot.athletes.some(row => row.id_athlete === input.actorId) || affiliation.id_athlete !== input.actorId || licence.id_athlete !== input.actorId || licence.id_saison !== input.seasonId || licence.id_affiliation_athlete !== affiliation.id_affiliation_athlete || licence.id_club_attribution !== affiliation.id_club) throw new SportsError("RESULTAT_INCOHERENT", "Les relations confirmées doivent être vérifiées.", 503, {}, true)
      return { state: "COMPLETE" as const, actorId: input.actorId, affiliationId: affiliation.id_affiliation_athlete, affiliationCreated: createdAffiliation, clubId: affiliation.id_club, club: snapshot.clubs.find(row => row.id_club === affiliation!.id_club)?.nom_club || affiliation.id_club, licence: mapAthleteLicence(licence, snapshot.seasons.find(row => row.id_saison === licence!.id_saison)), numeroLicence: licence.numero_licence }
    }
    if (licence) {
      affiliation ||= snapshot.affiliations.find(row => row.id_affiliation_athlete === licence!.id_affiliation_athlete)
      await assertRecordsAlive([{ table: "ATHLETES", rows: [{ id_athlete: input.actorId }] }, { table: "ATHLETE_AFFILIATIONS", rows: affiliation ? [affiliation] : [] }, { table: "ATHLETE_LICENCES", rows: [licence] }])
      await store.recoverCompleted([input.actorId], op); return result()
    }
    const prepare = () => {
      const actor = snapshot.athletes.find(row => row.id_athlete === input.actorId)
      if (!actor) throw new SportsError("ATHLETE_INTROUVABLE", "Athlète introuvable.", 404)
      const refs = licenceOptions(snapshot, date)
      if (!refs.clubs.some(row => row.id === input.clubId)) throw new SportsError("CLUB_INTERDIT", "Sélectionnez un club actif de la hiérarchie autorisée.", 422)
      if (!refs.seasons.some(row => row.id === input.seasonId)) throw new SportsError("SAISON_INTERDITE", "Saison introuvable.", 422)
      const active = snapshot.affiliations.filter(row => row.id_athlete === input.actorId && affiliationAt(row, date))
      if (active.length > 1) throw new SportsError("RATTACHEMENT_AMBIGU", "Plusieurs affiliations sont effectives. Vérifiez les mouvements.")
      if (!affReceipt) affiliation = active.find(row => row.id_statut_affiliation === "SAF001")
      let affiliationPlan: SportsPlan | null = null
      if (affiliation && affiliation.id_club !== input.clubId) throw new SportsError("TRANSFERT_REQUIS", "Un transfert est requis pour changer de club.")
      if (!affiliation) {
        if (snapshot.affiliations.some(row => row.id_athlete === input.actorId)) throw new SportsError("MOUVEMENT_REQUIS", "Un historique existe. Utilisez le mouvement ou la correction appropriée ; aucune première affiliation automatique.")
        if (input.confirmAffiliation !== "true") throw new SportsError("CONFIRMATION_REQUISE", "Confirmez explicitement la création de la première affiliation.", 422)
        const firstDate = canonicalDate(input.affiliationDate, "affiliationDate")
        if (firstDate > date) throw new SportsError("AFFILIATION_FUTURE", "L'affiliation doit être effective à la délivrance.", 422)
        affiliationPlan = planAthleteTransfer(snapshot, input.actorId, { id_club: input.clubId, date_debut: firstDate, date_fin: "", id_statut_affiliation: "SAF001", id_type_transfert: "TRF001", id_affiliation_precedente: "", observations: "" }, date)
      }
      const aff = affiliation || affiliationPlan!.inserts.ATHLETE_AFFILIATIONS[0]
      const licencePlan = allocateSportsLicences({ ...snapshot, affiliations: [...snapshot.affiliations.filter(row => row.id_affiliation_athlete !== aff.id_affiliation_athlete), aff] }, { id_athlete: input.actorId, id_club: input.clubId, id_affiliation_athlete: aff.id_affiliation_athlete, id_saison: input.seasonId, date_delivrance: date, id_statut_licence: "STL001" })
      licencePlan.operationDate = date
      if (affiliationPlan) affiliationPlan.operationDate = date
      store.validatePlans([...(affiliationPlan ? [affiliationPlan] : []), licencePlan])
      return { affiliationPlan, licencePlan }
    }
    let plans = prepare()
    const commit = async (stage: "affiliationPlan" | "licencePlan") => {
      for (let attempt = 0; attempt < 3; attempt++) {
        const plan = plans[stage]!
        plan.audit = { userId, action: "EXISTING_ATHLETE_LICENCE_" + stage, at: new Date().toISOString() }
        try { started = true; return (await store.commit(op, plan))[0] }
        catch (error) {
          if (!(error instanceof SportsError) || error.code !== "RESERVATION_EXISTANTE" || attempt === 2) throw error
          const confirmed = await store.completed(plan.book, op)
          if (confirmed) return confirmed[0]
          snapshot = await store.load("licence"); plans = prepare()
        }
      }
      throw new SportsError("CONCURRENCE", "Reprenez la même tentative.")
    }
    if (!affiliation) { affiliation = await commit("affiliationPlan"); createdAffiliation = true }
    if (plans.affiliationPlan && affiliation.id_affiliation_athlete !== plans.affiliationPlan.resultIds[0]) plans = prepare()
    licence = await commit("licencePlan")
    await store.release(lease!)
    return result()
  } catch (error) {
    const cause = error instanceof RecordManagementError ? new SportsError(error.code, error.message, error.status, {}, error.uncertain) : error instanceof SportsError ? error : new SportsError("SOURCE_INDISPONIBLE", "Résultat non confirmé. Reprenez la même tentative.", 503, {}, true)
    if (!started && lease) await store.release(lease).catch(() => undefined)
    throw new ExistingLicenceFailure(cause.code === "SUPPRESSION_VOLONTAIRE" ? "REJECTED" : createdAffiliation || started ? "PARTIAL" : cause.uncertain ? "UNCERTAIN" : "REJECTED", cause)
  }
}
export const deliverExistingAthleteLicence = (userId: string, payload: unknown) => runExistingAthleteLicence(createGoogleSportsStore(), userId, payload)
