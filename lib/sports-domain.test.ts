import test from "node:test"
import assert from "node:assert/strict"
// @ts-expect-error Explicit Node test extension.
import { affiliationAt, operation, temporalState, type SportsPlan, type SportsSnapshot } from "./sports-model.ts"
// @ts-expect-error Explicit Node test extension.
import { allocateSportsLicences, modifySportsLicence } from "./sports-licences-domain.ts"
// @ts-expect-error Explicit Node test extension.
import { planAthleteTransfer } from "./athlete-transfers-domain.ts"

function fixture(): SportsSnapshot {
  return { affiliations: [{ id_affiliation_athlete: "AFA-000001", id_athlete: "ATH00001", id_club: "0101001", date_debut: "2025-01-01", date_fin: "", id_statut_affiliation: "SAF001", observations: "", id_type_transfert: "", id_affiliation_precedente: "" }], licences: [], counters: [], clubs: ["0101001", "0101002", "0101003", "701019"].map(id_club => ({ id_club })), athletes: ["ATH00001", "ATH00002"].map(id_athlete => ({ id_athlete })), seasons: [{ id_saison: "SAI006", date_debut: "2026-01-01", date_fin: "2026-12-31" }, { id_saison: "SAI007", date_debut: "2027-01-01", date_fin: "2027-12-31" }], transferTypes: ["TRF001", "TRF002", "TRF003"].map(id_type_transfert => ({ id_type_transfert })), licenceStatuses: ["STL001", "STL003", "STL005"].map(id_statut_licence => ({ id_statut_licence })), parameters: [{ cle_parametre: "TRANSFERT_AFFILIATION_SANS_CHEVAUCHEMENT", valeur_parametre: "TRUE" }, { cle_parametre: "LICENCE_SPORTIVE_NUMEROTATION", valeur_parametre: "CLUB_COMPTEUR_SAISON" }, { cle_parametre: "LICENCE_SPORTIVE_TRANSFERT_CONSERVATION", valeur_parametre: "TRUE" }] }
}
const licence = { id_athlete: "ATH00001", id_saison: "SAI006", id_affiliation_athlete: "AFA-000001", date_delivrance: "01/05/2026", id_statut_licence: "STL001" }
const transfer = { id_type_transfert: "TRF002", id_affiliation_precedente: "AFA-000001", id_club: "0101002", date_debut: "01/06/2026", date_fin: "30/06/2026", id_statut_affiliation: "SAF001" }
function apply(s: SportsSnapshot, plan: SportsPlan) {
  for (const update of plan.updates) {
    const rows = update.table === "ATHLETE_AFFILIATIONS" ? s.affiliations : update.table === "ATHLETE_LICENCES" ? s.licences : s.counters
    const row = rows.find(item => item[update.key] === update.id)!
    Object.assign(row, update.fields)
  }
  s.affiliations.push(...(plan.inserts.ATHLETE_AFFILIATIONS || [])); s.licences.push(...(plan.inserts.ATHLETE_LICENCES || [])); s.counters.push(...(plan.inserts.COMPTEURS_LICENCES || []))
}
test("numéro texte 001, minimum trois chiffres et 999 vers 1000, sans mutation de la source", () => {
  const s = fixture(), before = JSON.stringify(s), plan = allocateSportsLicences(s, licence)
  assert.equal(plan.inserts.ATHLETE_LICENCES[0].numero_licence, "0101001001")
  assert.equal(JSON.stringify(s), before)
  s.counters.push({ id_compteur_licence: "CPT-SAI006-0101001", id_club: "0101001", id_saison: "SAI006", dernier_compteur: "999", statut_compteur: "PRET" })
  assert.equal(allocateSportsLicences(s, licence).inserts.ATHLETE_LICENCES[0].numero_licence, "01010011000")
})
test("nouvelle saison, renouvellement et historique annulé ne recyclent pas les compteurs", () => {
  const s = fixture(); apply(s, allocateSportsLicences(s, licence)); s.licences[0].id_statut_licence = "STL005"
  assert.throws(() => allocateSportsLicences(s, licence), /déjà une licence/)
  const next = allocateSportsLicences(s, { ...licence, id_saison: "SAI007", date_delivrance: "01/05/2027" })
  assert.equal(next.inserts.ATHLETE_LICENCES[0].numero_licence, "0101001001")
  assert.equal(s.licences.length, 1)
})
test("nouveau compteur vérifie les anciennes licences, même annulées", () => {
  const s = fixture(); s.licences.push({ id_licence: "OLD", id_athlete: "ATH00002", id_saison: "SAI006", id_affiliation_athlete: "AFA-000001", id_club_attribution: "0101001", numero_licence: "0101001037", compteur_saison: "37", id_statut_licence: "STL005" })
  assert.equal(allocateSportsLicences(s, licence).inserts.ATHLETE_LICENCES[0].numero_licence, "0101001038")
})
test("compteur A_VERIFIER, numéro hors format, club invalide et saisie manuelle bloqués", () => {
  const s = fixture(); s.counters.push({ id_compteur_licence: "CPT-SAI006-0101001", id_club: "0101001", id_saison: "SAI006", dernier_compteur: "0", statut_compteur: "A_VERIFIER" })
  assert.throws(() => allocateSportsLicences(s, licence), /A_VERIFIER/)
  s.counters = []; s.affiliations[0].id_club = "701019"
  assert.throws(() => allocateSportsLicences(s, licence), /sept chiffres/)
  s.affiliations[0].id_club = "0101001"
  assert.throws(() => allocateSportsLicences(s, { ...licence, numero_licence: "123" }), /serveur/)
  s.licences.push({ id_licence: "OLD", id_athlete: "OTHER", id_saison: "SAI006", id_club_attribution: "0101001", numero_licence: "HISTORIQUE" })
  assert.throws(() => allocateSportsLicences(s, licence), /historiques/)
})
test("transfert futur conserve le rattachement courant jusqu'à D-1", () => {
  const s = fixture(), plan = planAthleteTransfer(s, "ATH00001", { ...transfer, id_type_transfert: "TRF003", date_fin: "" }, "2026-05-01")
  apply(s, plan)
  assert.equal(s.affiliations[0].date_fin, "2026-05-31")
  assert.equal(affiliationAt(s.affiliations[0], "2026-05-31"), true)
  assert.equal(affiliationAt(s.affiliations[0], "2026-06-01"), false)
  assert.equal(temporalState(s.affiliations[1], "2026-05-01"), "À venir")
  assert.equal(s.affiliations[0].id_type_transfert, "")
})
test("cession : fin requise, interruption distincte, retour explicite sans réactivation aveugle", () => {
  const s = fixture()
  assert.throws(() => planAthleteTransfer(s, "ATH00001", { ...transfer, date_fin: "" }, "2026-06-01"), /fin/)
  const loan = planAthleteTransfer(s, "ATH00001", transfer, "2026-06-01"); apply(s, loan)
  const origin = s.affiliations[0], interruption = s.affiliations.find(row => row.id_statut_affiliation === "SAF003")!
  assert.equal(planAthleteTransfer(s, "ATH00001", { ...origin, observations: "Note historique" }, "2026-06-01", origin.id_affiliation_athlete).updates[0].fields.observations, "Note historique")
  assert.throws(() => planAthleteTransfer(s, "ATH00001", { ...interruption, id_statut_affiliation: "SAF001" }, "2026-07-01", interruption.id_affiliation_athlete), /retour contrôlé/)
  assert.equal(s.affiliations.filter(row => affiliationAt(row, "2026-07-01")).length, 0)
  const result = planAthleteTransfer(s, "ATH00001", { action: "RETURN", id_affiliation_precedente: loan.resultIds[0], id_type_transfert: "TRF002", date_debut: "01/07/2026", date_fin: "", id_statut_affiliation: "SAF001" }, "2026-07-01")
  apply(s, result)
  assert.equal(s.affiliations.filter(row => affiliationAt(row, "2026-07-01"))[0].id_club, "0101001")
  assert.equal(s.affiliations[0].id_statut_affiliation, "SAF002")
  assert.equal(s.affiliations.find(row => row.id_statut_affiliation === "SAF003")?.date_fin, "2026-06-30")
})
test("chevauchement de clubs différents, précédent étranger et première affiliation rétroactive rejetés", () => {
  const s = fixture(); s.affiliations.push({ ...s.affiliations[0], id_affiliation_athlete: "OTHER", id_club: "0101003", date_debut: "2026-06-10" })
  assert.throws(() => planAthleteTransfer(s, "ATH00001", transfer, "2026-05-01"), /chevauchent/)
  assert.throws(() => planAthleteTransfer(fixture(), "ATH00002", transfer, "2026-05-01"), /rattachement effectif/)
  assert.throws(() => planAthleteTransfer(fixture(), "ATH00001", { ...transfer, id_type_transfert: "TRF001", id_affiliation_precedente: "" }, "2026-05-01"), /historique/)
})
test("modification d'une cession recalcule ses segments et vérifie les chevauchements", () => {
  const s = fixture(), first = planAthleteTransfer(s, "ATH00001", transfer, "2026-05-01"); apply(s, first)
  const edit = planAthleteTransfer(s, "ATH00001", { ...transfer, date_debut: "02/06/2026" }, "2026-05-01", first.resultIds[0], first.context)
  apply(s, edit)
  assert.equal(s.affiliations[0].date_fin, "2026-06-01")
  assert.equal(s.affiliations.find(row => row.id_statut_affiliation === "SAF003")?.date_debut, "2026-06-02")
})
test("transfert ne modifie pas une licence, numéro immuable en modification", () => {
  const s = fixture(); apply(s, allocateSportsLicences(s, licence)); const history = JSON.stringify(s.licences)
  apply(s, planAthleteTransfer(s, "ATH00001", transfer, "2026-06-01"))
  assert.equal(JSON.stringify(s.licences), history)
  assert.throws(() => modifySportsLicence(s, s.licences[0].id_licence, { numero_licence: "CHANGED" }), /immuables/)
})
test("clé de tentative canonique, dates impossibles et saisons incompatibles", () => {
  const key = "11111111-1111-4111-8111-111111111111"
  assert.equal(operation(key, { a: 1, b: 2 }).fingerprint, operation(key, { b: 2, a: 1 }).fingerprint)
  assert.throws(() => operation("", {}), /tentative/)
  assert.throws(() => allocateSportsLicences(fixture(), { ...licence, date_delivrance: "31/02/2026" }), /date/)
  assert.throws(() => allocateSportsLicences(fixture(), { ...licence, date_delivrance: "01/01/2027" }), /saison/)
})

test("renouvellement groupé, compteurs indépendants et compteur périmé", () => {
  const s = fixture(); apply(s, allocateSportsLicences(s, licence))
  const renewal = allocateSportsLicences(s, { ...licence, mode: "CLUB", id_club: "0101001", id_saison: "SAI007", date_delivrance: "01/05/2027", id_affiliations_athletes: ["AFA-000001"] })
  apply(s, renewal); assert.equal(s.licences.length, 2); assert.equal(s.counters.length, 2)
  s.affiliations.push({ ...s.affiliations[0], id_affiliation_athlete: "AFA-000002", id_athlete: "ATH00002", id_club: "0101002" })
  const other = allocateSportsLicences(s, { ...licence, id_athlete: "ATH00002", id_affiliation_athlete: "AFA-000002" })
  assert.equal(other.inserts.ATHLETE_LICENCES[0].numero_licence, "0101002001")
  s.counters[0].dernier_compteur = "0"; s.licences[0].id_athlete = "OLD"
  assert.throws(() => allocateSportsLicences(s, licence), /inférieur/)
})

test("ancien rattachement : club protégé, statut inconnu et acteur absent", () => {
  const s = fixture(), current = s.affiliations[0]
  const input = { ...current, date_debut: "01/01/2025", date_fin: "" }
  assert.throws(() => planAthleteTransfer(s, "ATH00001", { ...input, id_club: "0101002" }, "2026-05-01", current.id_affiliation_athlete), /nouveau transfert/)
  assert.throws(() => planAthleteTransfer(s, "ATH00001", { ...input, id_statut_affiliation: "UNKNOWN" }, "2026-05-01", current.id_affiliation_athlete), /Statut/)
  assert.throws(() => planAthleteTransfer(s, "UNKNOWN", transfer, "2026-05-01"), /introuvable/)
})

test("retour borné et transfert définitif pendant une cession", () => {
  const s = fixture(); s.affiliations[0].date_fin = "2026-08-01"
  const loan = planAthleteTransfer(s, "ATH00001", transfer, "2026-06-01"); apply(s, loan)
  const returning = { action: "RETURN", id_affiliation_precedente: loan.resultIds[0], id_type_transfert: "TRF002", date_debut: "02/08/2026", date_fin: "", id_statut_affiliation: "SAF001" }
  assert.throws(() => planAthleteTransfer(s, "ATH00001", returning, "2026-07-01"), /empêche/)
  const permanent = planAthleteTransfer(s, "ATH00001", { ...transfer, id_affiliation_precedente: loan.resultIds[0], id_type_transfert: "TRF003", date_debut: "15/06/2026", date_fin: "", id_club: "0101003" }, "2026-06-15")
  apply(s, permanent); assert.equal(s.affiliations.find(row => row.id_club === "0101001" && row.id_type_transfert === "TRF002")?.date_fin, "2026-06-14")
  assert.throws(() => planAthleteTransfer(s, "ATH00001", { ...returning, date_debut: "01/07/2026" }, "2026-07-01"), /interruption|empêche/)
})
