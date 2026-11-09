import test from "node:test"
import assert from "node:assert/strict"
// @ts-expect-error Node's TypeScript runner requires an explicit extension.
import { ligueContactsRevision, planLigueContacts } from "./ligue-contact-rules.ts"

const existing = [{ id_contact_entite: "VOL-CONTACT-OLD", id_type_structure: "STR001", id_entite: "01", id_type_acteur: "TAC003", id_acteur: "001", fonction_contact: "Président", est_contact_principal: true, statut: "ACTIF", observation: "" }]
const catalog = { actorsByType: {
  TAC003: [{ id: "001", nomComplet: "Officiel test", telephone: "123", email: "officiel@example.test" }],
  TAC002: [{ id: "001", nomComplet: "Coach test", telephone: "", email: "" }],
} }
const draft = (extra = {}) => ({ id: "", idTypeActeur: "TAC003", idActeur: "001", fonction: "Président", principal: true, statut: "ACTIF", observation: "", ...extra })
const plan = (contacts: unknown, rows = existing, revision = ligueContactsRevision(rows, "01")) => planLigueContacts("01", contacts, revision, rows, catalog)

test("creates server identifiers, keeps 01 as text and never stores actor coordinates", () => {
  const result = plan([draft(), draft({ idTypeActeur: "TAC002", fonction: "Secrétaire", principal: false })], [])
  assert.equal(result.length, 2)
  assert.match(result[0].id, /^VOL-CONTACT-/)
  assert.notEqual(result[0].id, result[1].id)
  assert.equal(result[0].create, true)
  assert.equal(result[0].record.id_entite, "01")
  assert.equal(result[0].record.est_contact_principal, true)
  assert.equal("telephone" in result[0].record, false)
  assert.equal("email" in result[0].record, false)
  assert.equal("nom_complet" in result[0].record, false)
})

test("updates an existing designation and deactivates omitted ones without deleting", () => {
  const updated = plan([draft({ id: "VOL-CONTACT-OLD", fonction: "Vice-président" })])
  assert.equal(updated[0].id, "VOL-CONTACT-OLD")
  assert.equal(updated[0].create, false)
  assert.equal(updated[0].record.fonction_contact, "Vice-président")
  assert.deepEqual(plan([])[0].record, { statut: "INACTIF", est_contact_principal: false })
})

test("rejects two principals, duplicate active people, and invalid category/person pairs", () => {
  assert.throws(() => plan([draft(), draft({ idTypeActeur: "TAC002" })], []), /Un seul responsable/)
  assert.throws(() => plan([draft(), draft({ principal: false })], []), /déjà une désignation active/)
  assert.throws(() => plan([draft({ idTypeActeur: "UNKNOWN" })], []), /introuvable/)
  assert.throws(() => plan([draft({ idActeur: "1" })], []), /introuvable/)
  assert.throws(() => plan([draft({ idActeur: 1 })], []), /chaînes/)
  assert.throws(() => plan([draft({ fonction: "" })], []), /fonction est obligatoire/)
  assert.throws(() => plan([draft({ principal: "TRUE" })], []), /coché ou décoché/)
})

test("prevents editing a contact belonging to another league or structure", () => {
  const foreign = [{ ...existing[0], id_entite: "1" }]
  assert.throws(() => plan([draft({ id: "VOL-CONTACT-OLD" })], foreign), /étrangère/)
  const entente = [{ ...existing[0], id_type_structure: "STR002" }]
  assert.throws(() => plan([draft({ id: "VOL-CONTACT-OLD" })], entente), /étrangère/)
})

test("rejects stale edits and duplicate contact identifiers", () => {
  assert.throws(() => plan([], existing, ligueContactsRevision([], "01")), /ont changé/)
  assert.throws(() => plan([], [...existing, ...existing]), /dupliqués/)
  assert.throws(() => plan([draft({ id: "VOL-CONTACT-OLD" }), draft({ id: "VOL-CONTACT-OLD" })]), /dupliquée/)
})

test("an unresolved reference can be deactivated, never introduced as an active contact", () => {
  const missing = [{ ...existing[0], id_acteur: "MISSING" }]
  assert.throws(() => plan([draft({ id: "VOL-CONTACT-OLD", idActeur: "MISSING" })], missing), /introuvable/)
  const result = plan([draft({ id: "VOL-CONTACT-OLD", idActeur: "MISSING", statut: "INACTIF" })], missing)
  assert.equal(result[0].record.statut, "INACTIF")
  assert.equal(result[0].record.est_contact_principal, false)
})
