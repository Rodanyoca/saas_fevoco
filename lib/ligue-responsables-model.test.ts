import { test } from "node:test"
import assert from "node:assert/strict"
// @ts-expect-error Node's TypeScript runner requires an explicit extension.
import { loadLigueResponsables } from "./ligue-responsables-model.ts"

const designation = (extra: Record<string, string | boolean> = {}) => ({
  id_type_structure: "STR001", id_entite: "01", id_type_acteur: "TAC003", id_acteur: "001",
  fonction_contact: "Président", est_contact_principal: false, statut: "ACTIF", ...extra,
})
const types = [
  { id_type_acteur: "TAC003", source_donnees: "OFFICIELS" },
  { id_type_acteur: "TAC002", source_donnees: "COACHS" },
]

test("resolves all active contacts by category, orders principal first and projects only useful fields", async () => {
  const calls: string[][] = []
  const contacts = await loadLigueResponsables({
    assignments: async () => [
      designation(),
      designation({ id_type_acteur: "TAC002", fonction_contact: "Secrétaire", est_contact_principal: true }),
      designation({ id_acteur: "inactive", statut: "INACTIF" }),
      designation({ id_acteur: "missing", fonction_contact: "Trésorier" }),
      designation({ id_type_structure: "STR002", id_acteur: "entente" }),
      designation({ id_entite: "1", id_acteur: "other-league" }),
    ],
    actorTypes: async () => types,
    actors: async sheets => {
      calls.push(sheets)
      return {
        OFFICIELS: [{ id_officiel: "001", nom_complet: "Officiel test", telephone: "", email: "officiel@example.test", numero_passeport: "NE PAS EXPOSER" }],
        COACHS: [{ id_coach: "001", nom_complet: "Coach test", telephone: "123", email: "" }],
      }
    },
  })
  assert.equal(calls.length, 1)
  assert.deepEqual(calls[0].sort(), ["COACHS", "OFFICIELS"])
  assert.equal(contacts["01"].length, 3)
  assert.deepEqual(contacts["01"].map(row => row.nomComplet), ["Coach test", "Officiel test", "Fiche acteur introuvable"])
  assert.equal(contacts["01"][0].role, "Secrétaire")
  assert.equal(contacts["01"][0].email, "Non renseigné")
  assert.equal(contacts["01"][1].telephone, "Non renseigné")
  assert.deepEqual(contacts["01"][2], {
    role: "Trésorier", nomComplet: "Fiche acteur introuvable", telephone: "Non renseigné", email: "Non renseigné", referenceIntrouvable: "TAC003 / missing",
  })
  assert.equal(contacts["1"].length, 1)
  assert.equal(JSON.stringify(contacts).includes("NE PAS EXPOSER"), false)
})

test("an empty designation list does not read actors or references", async () => {
  const unexpected = async (): Promise<never> => { throw new Error("Unexpected read") }
  assert.deepEqual(await loadLigueResponsables({ assignments: async () => [designation({ statut: "INACTIF" })], actorTypes: unexpected, actors: unexpected }), {})
})

test("an actor in another category never satisfies a missing reference", async () => {
  const data = await loadLigueResponsables({
    assignments: async () => [designation(), designation({ id_type_acteur: "TAC002" })], actorTypes: async () => types,
    actors: async () => ({ OFFICIELS: [], COACHS: [{ id_coach: "001", nom_complet: "Coach", telephone: "123", email: "coach@example.test" }] }),
  })
  assert.equal(data["01"][0].referenceIntrouvable, "TAC003 / 001")
  assert.equal(data["01"][0].telephone, "Non renseigné")
})

test("a source failure remains an error, never an empty result", async () => {
  await assert.rejects(loadLigueResponsables({
    assignments: async () => [designation()], actorTypes: async () => types,
    actors: async () => { throw new Error("Sheets unavailable") },
  }), /Sheets unavailable/)
  await assert.rejects(loadLigueResponsables({
    assignments: async () => { throw new Error("Territorial unavailable") }, actorTypes: async () => types, actors: async () => ({}),
  }), /Territorial unavailable/)
})

test("an unsupported actor type is reported without guessing its category", async () => {
  const data = await loadLigueResponsables({
    assignments: async () => [designation({ id_type_acteur: "UNKNOWN" })], actorTypes: async () => types,
    actors: async () => { throw new Error("Unexpected actor read") },
  })
  assert.equal(data["01"][0].referenceIntrouvable, "UNKNOWN / 001")
})
