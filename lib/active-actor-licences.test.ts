import assert from "node:assert/strict"
import test from "node:test"
// @ts-expect-error Node's TypeScript runner requires explicit extensions.
import { activeActorLicenceNumbers } from "./active-actor-licences.ts"
import type { BaseActorLicence } from "./types"
const licence = (extra: Partial<BaseActorLicence> = {}): BaseActorLicence => ({ idLicence: "L1", actorId: "C1", actorName: "", numeroLicence: "VOL-001", dateDebutValidite: "2026-01-01", dateFinValidite: "2026-12-31", idStatutLicence: "STL001", statutLicence: "STL001", dateDelivrance: "2026-01-01", idLicencePrecedente: "", numeroLicencePrecedente: "", ...extra })
test("numéro actif seulement pendant la période, bornes incluses", () => {
  for (const today of ["2026-01-01", "2026-12-31"]) assert.equal(activeActorLicenceNumbers([licence()], today).get("C1"), "VOL-001")
  for (const today of ["2025-12-31", "2027-01-01"]) assert.equal(activeActorLicenceNumbers([licence()], today).size, 0)
})
test("exclut suspension, annulation, dates invalides ou manquantes", () => {
  for (const extra of [{ idStatutLicence: "STL003" }, { idStatutLicence: "STL005" }, { dateFinValidite: "31/02/2026" }, { dateDebutValidite: "" }, { dateFinValidite: "2025-01-01" }]) assert.equal(activeActorLicenceNumbers([licence(extra)], "2026-06-01").size, 0)
})
test("renouvellement et sélection déterministe sans modifier l'historique", () => {
  const rows = [licence(), licence({ idLicence: "L2", numeroLicence: "VOL-002", dateDebutValidite: "01/05/2026" }), licence({ idLicence: "L3", numeroLicence: "FUTURE", dateDebutValidite: "2027-01-01", dateFinValidite: "2027-12-31" })]
  assert.equal(activeActorLicenceNumbers(rows, "2026-06-01").get("C1"), "VOL-002")
  assert.equal(rows.length, 3)
})
