import test from "node:test"
import assert from "node:assert/strict"
// @ts-expect-error Explicit extension required by the Node test runner.
import { competitionAthleteClubs } from "./competition-person-affiliations.ts"
const row = { id_athlete: "A1", id_club: "0101086", id_statut_affiliation: "SAF001", date_debut: "2025-01-01", date_fin: "" }
test("le club vient de l’affiliation datée et conserve ses zéros", () => {
  assert.equal(competitionAthleteClubs([row], "2026-11-05").get("A1"), "0101086")
})
test("bornes inclusives, dates françaises et fin ouverte", () => {
  const bounded = { ...row, date_debut: "01/11/2026", date_fin: "05/11/2026" }
  assert.equal(competitionAthleteClubs([bounded], "2026-11-01").get("A1"), "0101086")
  assert.equal(competitionAthleteClubs([bounded], "2026-11-05").get("A1"), "0101086")
  assert.equal(competitionAthleteClubs([bounded], "2026-11-06").has("A1"), false)
})
test("future, suspendue, terminée, annulée et date invalide ne donnent pas de club courant", () => {
  for (const invalid of [{ ...row, date_debut: "2027-01-01" }, ...["SAF002", "SAF003", "SAF004"].map(id_statut_affiliation => ({ ...row, id_statut_affiliation })), { ...row, date_debut: "31/02/2026" }, { ...row, date_debut: "" }, { ...row, date_fin: "2024-01-01" }]) assert.equal(competitionAthleteClubs([invalid], "2026-11-05").has("A1"), false)
})
test("transfert futur et rattachement multiple ne choisissent pas arbitrairement un club", () => {
  const old = { ...row, date_fin: "2026-11-05" }, next = { ...row, id_club: "0101002", date_debut: "2026-11-06" }
  assert.equal(competitionAthleteClubs([old, next], "2026-11-05").get("A1"), "0101086")
  assert.equal(competitionAthleteClubs([old, next], "2026-11-06").get("A1"), "0101002")
  assert.equal(competitionAthleteClubs([row, { ...row, id_club: "0101002" }], "2026-11-05").has("A1"), false)
  assert.equal(competitionAthleteClubs([row, row], "2026-11-05").get("A1"), "0101086")
})
