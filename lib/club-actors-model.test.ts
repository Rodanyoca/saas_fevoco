import test from "node:test"
import assert from "node:assert/strict"
// @ts-expect-error Node's TypeScript runner requires an explicit extension.
import { buildClubActorIndex, clubActorKpis, emptyClubActors } from "./club-actors-model.ts"
// @ts-expect-error Node's TypeScript runner requires an explicit extension.
import { formatDateFromSheet as formatDateForSheet } from "./compact-date.ts"

const references = {
  SEXES: [{ id_sexe: "S1", nom_sexe: "Masculin" }],
  STATUTS_AFFILIATION: [{ id_statut_affiliation: "CURRENT", nom_statut_affiliation: "ACTIF" }, { id_statut_affiliation: "OLD", nom_statut_affiliation: "INACTIF" }],
  TYPES_STRUCTURES: [{ id_type_structure: "CL", nom_type_structure: "CLUB" }, { id_type_structure: "LG", nom_type_structure: "LIGUE" }],
  TYPES_ACTEURS: [{ id_type_acteur: "OFF", nom_type_acteur: "OFFICIEL" }, { id_type_acteur: "AUT", nom_type_acteur: "AUTRE" }],
  FONCTION_OFFICIEL: [{ id_fonction: "P", nom_fonction: "Président" }],
  TYPES_AUTRES_ACTEURS: [{ id_type_autre_acteur: "TECH", nom_type_autre_acteur: "Technicien" }],
}
const current = { id_club: "C1", id_statut_affiliation: "CURRENT", date_debut: "2026-01-01", date_fin: "" }

test("conserve le coach dont la date d’affiliation est un numéro de série Sheets", () => {
  const result = buildClubActorIndex({ references, actors: { COACHS: [{ id_coach: "CO" }] }, affiliations: {
    COACH_AFFILIATIONS: [{ ...current, id_coach: "CO", date_debut: "45323" }],
  } }, "2026-10-08", formatDateForSheet)
  assert.deepEqual(result.byClub.C1?.coachs.map(row => row.id), ["CO"])
  assert.equal(result.ignoredRelations, 0)
})
test("joint les cinq familles au club par les identifiants et résout les libellés", () => {
  const bundle = buildClubActorIndex({ references, actors: {
    ATHLETES: [{ id_athlete: "A", nom_complet: "Athlète", statut: "ACTIF", id_sexe: "S1" }],
    COACHS: [{ id_coach: "CO", nom_complet: "Coach", statut: "INACTIF" }],
    MEDECINS: [{ id_medecin: "M", nom_complet: "Médecin", statut: "ACTIF" }],
    OFFICIELS: [{ id_officiel: "O", nom_complet: "Officiel", statut: "ACTIF" }],
    AUTRES: [{ id_autre_acteur: "AU", nom_complet: "Autre", id_type_autre_acteur: "TECH", statut: "ACTIF" }],
  }, affiliations: {
    ATHLETE_AFFILIATIONS: [{ ...current, id_athlete: "A" }], COACH_AFFILIATIONS: [{ ...current, id_coach: "CO" }], MEDECIN_AFFILIATIONS: [{ ...current, id_medecin: "M" }],
    OFFICIELS_AFFILIATIONS: [{ ...current, id_officiel: "O", id_entite: "C1", id_type_entite: "CL", id_fonction: "P" }],
    AUTRES_AFFILIATIONS: [{ id_autre_acteur: "AU", id_entite: "C1", id_type_entite: "CL", statut_affiliation: "ACTIF" }],
  } }, "2026-10-07", formatDateForSheet)
  assert.deepEqual(clubActorKpis(bundle.byClub.C1), { total: 5, athletes: 1, staff: 4, active: 4 })
  assert.equal(bundle.byClub.C1.athletes[0].sexe, "Masculin")
  assert.equal(bundle.byClub.C1.officiels[0].fonction, "Président")
  assert.equal(bundle.byClub.C1.autres[0].fonction, "Technicien")
})
test("exclut les autres clubs, affiliations inactives, futures et terminées", () => {
  const actors = { COACHS: ["CURRENT", "INACTIVE", "FUTURE", "EXPIRED", "OTHER"].map(id => ({ id_coach: id, nom_complet: id })) }
  const affiliations = { COACH_AFFILIATIONS: [
    { ...current, id_coach: "CURRENT" }, { ...current, id_coach: "INACTIVE", id_statut_affiliation: "OLD" },
    { ...current, id_coach: "FUTURE", date_debut: "2027-01-01" }, { ...current, id_coach: "EXPIRED", date_fin: "2026-10-06" },
    { ...current, id_coach: "OTHER", id_club: "C2" },
  ] }
  const result = buildClubActorIndex({ actors, affiliations, references }, "2026-10-07", formatDateForSheet)
  assert.deepEqual(result.byClub.C1.coachs.map(row => row.id), ["CURRENT"])
  assert.deepEqual(result.byClub.C2.coachs.map(row => row.id), ["OTHER"])
})
test("déduplique les périodes et mandats et ne confond pas les types de structure", () => {
  const actors = { OFFICIELS: [{ id_officiel: "O", nom_complet: "Officiel" }] }
  const affiliations = {
    OFFICIELS_AFFILIATIONS: [{ ...current, id_officiel: "O", id_entite: "C1", id_type_entite: "CL" }, { ...current, id_officiel: "O", id_entite: "C1", id_type_entite: "LG" }],
    MANDATS: [{ id_mandat: "M1", id_acteur: "O", id_type_acteur: "OFF", id_type_structure: "CL", id_structure: "C1", statut_mandat: "ACTIF", id_fonction: "P" }, { id_mandat: "M2", id_acteur: "O", id_type_acteur: "AUT", id_type_structure: "CL", id_structure: "C2", statut_mandat: "ACTIF" }],
  }
  const result = buildClubActorIndex({ actors, affiliations, references }, "2026-10-07", formatDateForSheet)
  assert.equal(result.byClub.C1.officiels.length, 1)
  assert.equal(result.byClub.C1.officiels[0].fonction, "Président")
  assert.equal(result.byClub.C2, undefined)
})
test("dates civiles françaises, bornes inclusives et relations orphelines", () => {
  const actors = { COACHS: [{ id_coach: "CO", nom_complet: "Coach" }] }
  const affiliations = { COACH_AFFILIATIONS: [
    { ...current, id_coach: "CO", date_debut: "07/10/2026", date_fin: "07/10/2026" },
    { ...current, id_coach: "CO", date_debut: "31/02/2026" }, { ...current, id_coach: "ABSENT" },
  ] }
  const result = buildClubActorIndex({ actors, affiliations, references }, "2026-10-07", formatDateForSheet)
  assert.equal(result.byClub.C1.coachs.length, 1)
  assert.equal(result.ignoredRelations, 2)
  assert.deepEqual(clubActorKpis(emptyClubActors()), { total: 0, athletes: 0, staff: 0, active: 0 })
})
