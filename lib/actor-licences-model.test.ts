import test from "node:test"
import assert from "node:assert/strict"
// @ts-expect-error Node's TypeScript runner requires explicit extensions.
import { buildActorLicenceData, type ActorLicenceSources } from "./actor-licences-model.ts"

const source = (): ActorLicenceSources => ({
  licences: [{ id_licence: "VOL-ACL-2026-000001", id_type_acteur: "TAC002", id_acteur: "CO1", id_affiliation_acteur: "AF1", id_cycle_licence: "CYC001", numero_licence: "001", date_delivrance: "01/01/2026", date_debut_validite: "01/01/2026", date_fin_validite: "31/10/2026", id_statut_licence: "STL001" }],
  actors: { COACHS: [{ id_coach: "CO1", nom_complet: "Coach", statut: "ACTIF" }] },
  affiliations: { COACH_AFFILIATIONS: [{ id_affiliation_coach: "AF1", id_coach: "CO1", id_club: "CL1", date_debut: "45323", id_statut_affiliation: "SAF001" }] },
  structures: { CLUBS: [{ id_club: "CL1", nom_club: "Club" }] },
  refs: { TYPES_ACTEURS: [{ id_type_acteur: "TAC002", nom_type_acteur: "COACH" }, { id_type_acteur: "TAC001", nom_type_acteur: "ATHLETE" }], CYCLES_LICENCES: [{ id_cycle_licence: "CYC001", nom_cycle_licence: "SPORTIF" }], STATUT_LICENCE: [{ id_statut_licence: "STL001", nom_statut_licence: "ACTIVE" }], STATUTS_AFFILIATION: [{ id_statut_affiliation: "SAF001", nom_statut_affiliation: "ACTIF" }] },
})
test("résout les références réelles, l’acteur et l’affiliation avec date série", () => {
  const { rows, references } = buildActorLicenceData(source(), "2026-10-08")
  assert.equal(rows[0].acteur, "Coach"); assert.equal(rows[0].cycle, "SPORTIF"); assert.equal(rows[0].affiliation, "Club · AF1")
  assert.equal(rows[0].statutEffectif, "VALIDE"); assert.equal(rows[0].remainingDays, 23)
  assert.equal(references.affiliations[0].dateDebut, "2024-02-01"); assert.equal(references.affiliations[0].status, "ACTIF")
  assert.deepEqual(references.types.map(row => row.id), ["TAC002"])
})
test("une date invalide ne produit pas de faux statut valide", () => {
  const data = source(); data.licences[0].date_debut_validite = "31/02/2026"
  assert.equal(buildActorLicenceData(data, "2026-10-08").rows[0].statutEffectif, "DATES_INVALIDES")
})
test("l’arbitre reste sans affiliation ; les libellés orphelins restent explicites", () => {
  const data = source(); data.licences[0].id_type_acteur = "TAC004"; data.licences[0].id_acteur = "ARB1"
  const row = buildActorLicenceData(data, "2026-10-08").rows[0]
  assert.equal(row.affiliation, "Non applicable"); assert.equal(row.acteur, "ARB1")
})
test("une affiliation officielle résout la fédération par les en-têtes vérifiés", () => {
  const data = source(); data.refs.TYPES_STRUCTURES = [{ id_type_structure: "STR000", nom_type_structure: "FEDERATION" }]
  data.structures.FEDERATION = [{ id_federation: "FED", nom_officiel: "Fédération" }]
  data.affiliations.OFFICIELS_AFFILIATIONS = [{ id_affiliation_officiel: "AFO", id_officiel: "OFF", id_type_entite: "STR000", id_entite: "FED", id_statut_affiliation: "SAF001", date_debut: "2026-01-01" }]
  const item = buildActorLicenceData(data, "2026-10-08").references.affiliations.find(row => row.id === "AFO")
  assert.equal(item?.label, "Fédération · AFO"); assert.equal(item?.targetExists, true)
})
