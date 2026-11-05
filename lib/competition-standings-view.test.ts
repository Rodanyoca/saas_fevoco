import test from "node:test"
import assert from "node:assert/strict"
// @ts-expect-error Explicit Node test extension.
import { buildCompetitionStandingsView, type StandingsInput } from "./competition-standings-view.ts"

function fixture(): StandingsInput {
  return { events: [{ id_epreuve_competition: "E1", nom_epreuve: "Indoor" }, { id_epreuve_competition: "E2", nom_epreuve: "Beach" }], phases: [{ id_phase_competition: "P1", id_epreuve_competition: "E1", nom_phase: "Groupes", numero_phase: "1", id_mode_phase: "MPH001" }, { id_phase_competition: "P2", id_epreuve_competition: "E1", nom_phase: "Finale", numero_phase: "2", id_mode_phase: "MPH002" }, { id_phase_competition: "P3", id_epreuve_competition: "E2", nom_phase: "Groupes", numero_phase: "1", id_mode_phase: "MPH001" }], groups: [{ id_groupe: "G1", id_phase_competition: "P1", nom_groupe: "Poule A" }, { id_groupe: "G2", id_phase_competition: "P1", nom_groupe: "Poule B" }, { id_groupe: "G3", id_phase_competition: "P3", nom_groupe: "Poule A" }], units: ["U1", "U2", "U3"].map(id_unite_competition => ({ id_unite_competition, statut: "ACTIF" })), assignments: [{ id_phase_unite: "A1", id_phase_competition: "P1", id_groupe: "G1", id_unite_competition: "U1", statut: "ACTIF" }, { id_phase_unite: "A2", id_phase_competition: "P1", id_groupe: "G2", id_unite_competition: "U2", statut: "ACTIF" }], matches: [], results: [], standings: [{ id_classement: "C1", id_phase_competition: "P1", id_groupe: "G1", id_unite_competition: "U1", rang: "1", points_classement: "0" }, { id_classement: "C2", id_phase_competition: "P1", id_groupe: "G2", id_unite_competition: "U2", rang: "1", points_classement: "0" }], resultTypes: [], unitLabels: { U1: "Club Alpha", U2: "Club Beta", U3: "Club Gamma" } }
}
test("sépare les IDs d’épreuves, phases et poules même avec des libellés identiques", () => {
  const view = buildCompetitionStandingsView(fixture())
  assert.equal(view.sections.length, 4)
  assert.equal(view.sections.find(section => section.groupId === "G1")?.rows[0].unit, "Club Alpha")
  assert.equal(view.sections.find(section => section.groupId === "G2")?.rows[0].unit, "Club Beta")
  assert.equal(view.sections.find(section => section.groupId === "G3")?.rows.length, 0)
  assert.equal(view.sections.find(section => section.phaseId === "P2")?.grouped, false)
})
test("le premier rang ne crée jamais une qualification", () => {
  const view = buildCompetitionStandingsView(fixture())
  assert.equal(view.qualifications.length, 0)
  assert.equal(view.sections[0].rows[0].qualification, "Non qualifiée")
})
test("présente la source, la poule et la destination d’une décision explicite", () => {
  const data = fixture()
  data.assignments.push({ id_phase_unite: "Q1", id_type_affectation_phase: "TAP002", id_phase_source: "P1", id_phase_competition: "P2", id_unite_competition: "U1", statut: "ACTIF" })
  let view = buildCompetitionStandingsView(data)
  assert.equal(view.qualifications[0].status, "Confirmée"); assert.equal(view.qualifications[0].sourceGroups, "Poule A"); assert.equal(view.qualifications[0].destination, "Finale")
  data.assignments[2].statut = "INACTIF"; view = buildCompetitionStandingsView(data)
  assert.equal(view.qualifications[0].status, "Inactive"); assert.equal(view.sections[0].rows[0].qualification, "Non qualifiée")
})
test("une correction du vainqueur signale la qualification devenue incohérente sans la modifier", () => {
  const data = fixture(); data.matches.push({ id_match: "M1", id_phase_competition: "P1", id_groupe: "G1", id_unite_a: "U1", id_unite_b: "U3" })
  data.results.push({ id_match: "M1", id_statut_resultat: "STR001", id_unite_vainqueur: "U1" })
  data.assignments.push({ id_phase_unite: "Q1", id_type_affectation_phase: "TAP002", id_phase_source: "P1", id_phase_competition: "P2", id_match_source: "M1", id_unite_competition: "U1", statut: "ACTIF" })
  assert.equal(buildCompetitionStandingsView(data).qualifications[0].status, "Confirmée")
  data.results[0].id_unite_vainqueur = "U3"
  assert.equal(buildCompetitionStandingsView(data).qualifications[0].status, "À vérifier")
  assert.equal(data.assignments[2].id_unite_competition, "U1")
})
test("références incomplètes signalées et classement obsolète détecté avec le calcul volley", () => {
  const data = fixture(); data.standings[0].matchs_joues = "9"
  assert.equal(buildCompetitionStandingsView(data).sections[0].stale, true)
  data.assignments.push({ id_type_affectation_phase: "TAP002", id_phase_competition: "P2", id_unite_competition: "UNKNOWN", statut: "ACTIF" })
  assert.equal(buildCompetitionStandingsView(data).qualifications[0].status, "À vérifier")
  assert.deepEqual(buildCompetitionStandingsView({ events: [], phases: [], groups: [], units: [], assignments: [], matches: [], results: [], standings: [], resultTypes: [], unitLabels: {} }), { sections: [], qualifications: [] })
})
