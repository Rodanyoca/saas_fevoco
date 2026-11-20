import "server-only"
import type { SportsStore } from "@/lib/sports-atomic-store"
import { SportsError, affiliationAt, canonicalDate, type SportsOperation, type SportsPlan, type SportsRow, type SportsSnapshot } from "@/lib/sports-model"
import { planAthleteTransfer } from "@/lib/athlete-transfers-domain"
import { allocateSportsLicences } from "@/lib/sports-licences-domain"

export function currentAttachmentSeason(s: SportsSnapshot, date: string) {
  const id = s.parameters.find(row => row.cle_parametre === "SAISON_COURANTE")?.valeur_parametre
  const season = s.seasons.find(row => row.id_saison === id)
  const status = s.seasonStatuses?.find(row => row.id_statut_saison === season?.id_statut_saison)
  const label = (status?.nom_statut_saison || status?.nom_statut || "").toUpperCase()
  if (!season || !["ACTIF", "ACTIVE"].includes(label) || canonicalDate(season.date_debut, "saison") > date || canonicalDate(season.date_fin, "saison") < date) throw new SportsError("SAISON_COURANTE_INVALIDE", "La saison courante configurée n'est pas active à la date de l'opération.", 422)
  return season
}

export function attachmentLicencePlan(s: SportsSnapshot, affiliation: SportsRow, date: string): SportsPlan {
  const season = currentAttachmentSeason(s, date)
  if (affiliation.id_statut_affiliation !== "SAF001" || !affiliationAt(affiliation, date)) throw new SportsError("RATTACHEMENT_NON_ACTUEL", "Une affiliation future ou déjà terminée relève de la programmation ou de l'import historique. Aucune écriture effectuée.", 422)
  const previous = s.licences.filter(row => row.id_athlete === affiliation.id_athlete && row.id_statut_licence === "STL001")
  const target = affiliation.id_type_transfert === "TRF002" ? "STL003" : "STL004"
  if (previous.length && !s.licenceStatuses.some(row => row.id_statut_licence === target)) throw new SportsError("STATUT_REMPLACEMENT_ABSENT", "Le statut de suspension ou clôture est absent du référentiel.", 503)
  const plan = allocateSportsLicences(s, { id_athlete: affiliation.id_athlete, id_affiliation_athlete: affiliation.id_affiliation_athlete, id_saison: season.id_saison, date_delivrance: date, id_statut_licence: "STL001" }, true)
  plan.updates.push(...previous.map(row => ({ table: "ATHLETE_LICENCES", key: "id_licence", id: row.id_licence, fields: { id_statut_licence: target } })))
  plan.operationDate = date
  return plan
}

function projected(s: SportsSnapshot, plan: SportsPlan) {
  const changes = new Map(plan.updates.map(update => [update.id, update.fields]))
  return { ...s, affiliations: [...s.affiliations.map(row => ({ ...row, ...changes.get(row.id_affiliation_athlete) })), ...(plan.inserts.ATHLETE_AFFILIATIONS || [])] }
}

// Both books retain the same operation fingerprint. A partial result keeps ownership;
// only the licence book atomically replaces active statuses and allocates the number.
export async function runAthleteAttachment(store: SportsStore, op: SportsOperation, actorId: string, input: SportsRow, today: string, initialSnapshot?: SportsSnapshot, userId = "") {
  const lease = await store.acquire([actorId], op, true)
  let attempted = false
  try {
    const [affReceipt, licReceipt] = await Promise.all([store.receipt("affiliations", op), store.receipt("licences", op)])
    attempted = Boolean(affReceipt)
    let s = initialSnapshot || await store.load("attachment")
    let operationSeason = affReceipt?.operationSeason
    const pinSeason = () => { if (operationSeason) s = { ...s, parameters: [...s.parameters.filter(row => row.cle_parametre !== "SAISON_COURANTE"), { cle_parametre: "SAISON_COURANTE", valeur_parametre: operationSeason }] } }
    const confirmed = (affiliation: SportsRow, licence: SportsRow) => {
      if (affiliation.id_athlete !== actorId || licence.id_athlete !== actorId || licence.id_affiliation_athlete !== affiliation.id_affiliation_athlete || licence.id_club_attribution !== affiliation.id_club || operationSeason && licence.id_saison !== operationSeason) throw new SportsError("RESULTAT_INCOHERENT", "Les relations confirmées nécessitent une vérification.", 503, {}, true)
      return { affiliation, licence }
    }
    pinSeason()
    const date = affReceipt?.operationDate || today
    if (licReceipt) {
      const [affiliations, licences] = await Promise.all([store.completed("affiliations", op), store.completed("licences", op)])
      if (!affiliations?.[0] || !licences?.[0]) throw new SportsError("RESULTAT_INDETERMINE", "Résultat incomplet : vérification requise.", 503, {}, true)
      await store.release(lease)
      return confirmed(affiliations[0], licences[0])
    }
    let affiliation = affReceipt ? (await store.completed("affiliations", op))?.[0] : undefined
    if (affReceipt && !affiliation) throw new SportsError("RESULTAT_INDETERMINE", "Le rattachement confirmé est absent.", 503, {}, true)
    for (let attempt = 0; attempt < 3; attempt++) {
      const affPlan = affiliation ? null : planAthleteTransfer(s, actorId, input, date)
      if (affPlan) { affPlan.operationDate = date; operationSeason = affPlan.operationSeason = currentAttachmentSeason(s, date).id_saison }
      const after = affPlan ? projected(s, affPlan) : s
      const aff = affiliation || affPlan!.inserts.ATHLETE_AFFILIATIONS.find(row => row.id_affiliation_athlete === affPlan!.resultIds[0])!
      const licPlan = attachmentLicencePlan(after, aff, date)
      if (userId) {
        const audit = { userId, action: "ATHLETE_ATTACHMENT", at: new Date().toISOString() }
        if (affPlan) affPlan.audit = audit
        licPlan.audit = audit
      }
      store.validatePlans([...(affPlan ? [affPlan] : []), licPlan])
      try {
        attempted = true
        if (affPlan) affiliation = (await store.commit(op, affPlan))[0]
        const licence = (await store.commit(op, licPlan))[0]
        await store.release(lease)
        return confirmed(affiliation!, licence)
      } catch (error) {
        if (!(error instanceof SportsError) || error.code !== "RESERVATION_EXISTANTE" || attempt === 2) throw error
        s = await store.load("attachment")
        pinSeason()
        affiliation = (await store.completed("affiliations", op))?.[0]
      }
    }
    throw new SportsError("CONCURRENCE", "Reprenez la même tentative.")
  } catch (error) {
    if (error instanceof SportsError && error.code === "SUPPRESSION_VOLONTAIRE") { await store.release(lease).catch(() => undefined); throw error }
    if (!attempted) await store.release(lease).catch(() => undefined)
    if (attempted) throw new SportsError(error instanceof SportsError ? error.code : "RESULTAT_INDETERMINE", `${error instanceof Error ? error.message : "Résultat non confirmé."} Reprenez cette même tentative pour terminer affiliation et licence.`, error instanceof SportsError ? error.status : 503, {}, true)
    throw error
  }
}
