/* global require, Request */
/* eslint-disable @typescript-eslint/no-require-imports -- Real services and atomic Sheets emulator. */
const test = require("node:test"), assert = require("node:assert/strict")
const { harness } = require("../tests/helpers/sports-harness.cjs")
const uuid = n => `${String(n).padStart(8, "0")}-1111-4111-8111-111111111111`
function setup() {
  const h = harness({ onboarding: true, management: true })
  const service = h.loadModule("lib/record-management.ts"), model = h.loadModule("lib/record-management-model.ts"), api = h.loadModule("lib/record-management-api.ts")
  return { ...h, service, model, api }
}
const actor = { entity: "actor", family: "athlete", id: "ATH00001" }
function add(h, book, table, row) {
  const sheet = h.books[book].sheets[table] ||= { id: Object.keys(h.books[book].sheets).length + 1, values: [Object.keys(row)] }
  for (const key of Object.keys(row)) if (!sheet.values[0].includes(key)) sheet.values[0].push(key)
  sheet.values.push(sheet.values[0].map(key => row[key] || ""))
}
async function remove(h, target, operation = uuid(1)) {
  const preview = await h.service.previewManagedRecord(target)
  return h.service.deleteManagedRecord(target, preview.version, operation, "U1")
}

test("editions protegees : version obligatoire et aucune mutation sur conflit", async () => {
  const h = setup(), preview = await h.service.previewManagedRecord(actor, true)
  let writes = 0
  const request = version => new Request("http://localhost/api/athletes/ATH00001", { method: "PATCH", headers: { origin: "http://localhost", ...(version ? { "If-Match": version } : {}) } })
  const run = async () => { writes++; return Response.json({ saved: true }) }
  assert.equal((await h.api.managedEditRequest(request(""), actor, run)).status, 409)
  assert.equal((await h.api.managedEditRequest(request("stale"), actor, run)).status, 409)
  assert.equal(writes, 0)
  assert.equal((await h.api.managedEditRequest(request(preview.version), actor, run)).status, 200)
  assert.equal(writes, 1)
})

test("deux instances : exclusion persistante et suppression repetee sans doublon", async () => {
  const h = setup(), target = { ...actor, id: "TEST-CONCURRENT" }
  add(h, "ACT", "ATHLETES", { id_athlete: target.id, nom_complet: "Test" })
  const preview = await h.service.previewManagedRecord(target)
  const results = await Promise.allSettled([1, 2].map(n => h.service.deleteManagedRecord(target, preview.version, uuid(n), "U1")))
  assert.equal(results.filter(result => result.status === "fulfilled").length, 1)
  assert.equal(h.books.ACT.metadata.filter(item => item.metadataKey.startsWith("fevoco:delete-receipt:")).length, 1)
  const winner = results.findIndex(result => result.status === "fulfilled") + 1
  assert.equal((await h.service.deleteManagedRecord(target, preview.version, uuid(winner), "U1")).deleted, true)
})

test("suppression licence puis affiliation puis acteur, reservations et recus conserves", async () => {
  const h = setup(), result = await h.run()
  const licence = { entity: "licence", family: "athlete", id: result[0].id_licence }
  await assert.rejects(remove(h, actor), error => error.code === "DEPENDANCES_EXISTANTES")
  await assert.rejects(remove(h, { entity: "affiliation", family: "athlete", id: "AFA-000001" }), error => error.code === "DEPENDANCES_EXISTANTES")
  const counter = JSON.stringify(h.books.LIC.sheets.COMPTEURS_LICENCES.values)
  const preview = await h.service.previewManagedRecord(licence)
  await h.service.deleteManagedRecord(licence, preview.version, uuid(2), "U1")
  assert.equal(JSON.stringify(h.books.LIC.sheets.COMPTEURS_LICENCES.values), counter)
  assert.ok(h.books.LIC.metadata.some(item => item.metadataKey.includes("number:SAI006:0101001001")))
  assert.equal((await h.service.deleteManagedRecord(licence, preview.version, uuid(2), "U1")).deleted, true)
  await assert.rejects(h.run(), error => error.code === "SUPPRESSION_VOLONTAIRE")
  await remove(h, { entity: "affiliation", family: "athlete", id: "AFA-000001" }, uuid(3))
  await remove(h, actor, uuid(4))
  assert.ok(h.books.ACT.sheets.ATHLETES.values[1].every(value => !value))
  assert.equal(h.books.ACT.sheets.ATHLETES.values[2][0], "ATH00002", "aucun deplacement de ligne")
  const guards = h.loadModule("lib/business-write-guard.ts")
  await assert.rejects(guards.assertRecordsAlive([{ table: "SELECTIONS", rows: [{ id_athlete: "ATH00001" }] }]), error => error.code === "SUPPRESSION_VOLONTAIRE")
})

for (const status of ["STL001", "STL002", "STL005"]) test(`affiliation bloquee par licence de statut ${status}`, async () => {
  const h = setup()
  add(h, "LIC", "ATHLETE_LICENCES", { id_licence: "OLD", id_athlete: "ATH00001", id_affiliation_athlete: "AFA-000001", id_statut_licence: status })
  await assert.rejects(remove(h, { entity: "affiliation", family: "athlete", id: "AFA-000001" }), error => error.code === "DEPENDANCES_EXISTANTES")
})
test("predecesseur reference et licence referencee : refus", async () => {
  const h = setup()
  add(h, "AFF", "ATHLETE_AFFILIATIONS", { id_affiliation_athlete: "NEXT", id_athlete: "ATH00001", id_affiliation_precedente: "AFA-000001" })
  await assert.rejects(remove(h, { entity: "affiliation", family: "athlete", id: "AFA-000001" }), error => error.code === "DEPENDANCES_EXISTANTES")
  const licence = (await h.run())[0]
  add(h, "COMP", "COMPETITIONS_INTERVENANTS", { id: "INV1", id_licence: licence.id_licence })
  await assert.rejects(remove(h, { entity: "licence", family: "athlete", id: licence.id_licence }), error => error.code === "DEPENDANCES_EXISTANTES")
})
for (const [book, table, row] of [
  ["COMP", "COMPETITIONS_INTERVENANTS", { id: "C1", id_type_acteur: "TAC001", id_acteur: "ATH00999" }],
  ["NAT", "STAFFS", { id: "S1", id_type_acteur: "TAC001", id_entourage: "ATH00999" }],
  ["ACTIVITY", "ACTIVITES_PARTICIPANTS", { id: "P1", id_type_acteur: "TAC001", id_acteur: "ATH00999" }],
  ["DOC", "DOCUMENTS_RELATIONS", { id: "D1", id_entite: "ATH00999" }],
  ["AFF", "MANDATS", { id_mandat: "M1", id_acteur: "ATH00999" }],
  ["ACT", "GRADES", { id_grade_attribution: "G1", id_athlete: "ATH00999" }],
]) test(`acteur reference par ${table} : refus`, async () => {
  const h = setup(); add(h, "ACT", "ATHLETES", { id_athlete: "ATH00999", nom_complet: "Test" }); add(h, book, table, row)
  await assert.rejects(remove(h, { ...actor, id: "ATH00999" }), error => error.code === "DEPENDANCES_EXISTANTES")
})
for (const family of ["athlete", "coach", "arbitre", "medecin", "officiel", "autre"]) test(`suppression sans reference famille ${family}`, async () => {
  const h = setup(), config = h.model.families[family], target = { entity: "actor", family, id: `TEST-${family}` }
  add(h, "ACT", config.table, { [config.key]: target.id, nom_complet: "Test" })
  assert.equal((await remove(h, target)).deleted, true)
})
test("erreur de lecture dependante, version concurrente, session et lecture seule", async () => {
  const h = setup(), target = { ...actor, id: "ATH00999" }; add(h, "ACT", "ATHLETES", { id_athlete: target.id, nom_complet: "Test" })
  const preview = await h.service.previewManagedRecord(target)
  h.state.failReadBook = "DOC"
  await assert.rejects(h.service.deleteManagedRecord(target, preview.version, uuid(1), "U1"))
  assert.equal(h.calls.filter(call => call.business).length, 0)
  h.state.failReadBook = ""
  h.books.ACT.sheets.ATHLETES.values.at(-1)[3] = "Modification concurrente"
  await assert.rejects(h.service.deleteManagedRecord(target, preview.version, uuid(1), "U1"), error => error.code === "VERSION_CONFLIT")
  for (const flag of ["noSession", "denyWrite"]) {
    h.state[flag] = true
    const response = await h.api.recordDELETE(new Request("http://localhost/api/actors/records", { method: "DELETE", headers: { origin: "http://localhost" }, body: JSON.stringify({ ...target, operation: uuid(1), version: preview.version }) }))
    assert.equal(response.status, flag === "noSession" ? 401 : 403); h.state[flag] = false
  }
})
test("reponse perdue puis verification, double requete et ancienne creation unifiee", async () => {
  const h = setup(), domain = h.loadModule("lib/athlete-registration.ts")
  const input = { nomComplet: "Test complet", idSexe: "SEX001", clubId: "0101001", affiliationDate: "01012026", seasonId: "SAI006", idempotencyKey: uuid(8) }
  const created = await domain.runAthleteRegistration(h.createStore(), "U1", input, "2026-11-19")
  const target = { entity: "licence", family: "athlete", id: created.licence.idLicence }, preview = await h.service.previewManagedRecord(target)
  h.state.failAfterBook = "LIC"
  await assert.rejects(h.service.deleteManagedRecord(target, preview.version, uuid(9), "U1"))
  h.state.failAfterBook = ""; h.state.hideGetBook = ""; h.state.hideReceiptBook = ""
  assert.equal((await h.service.deleteManagedRecord(target, preview.version, uuid(9), "U1")).deleted, true)
  await assert.rejects(domain.runAthleteRegistration(h.createStore(), "U1", input, "2026-11-19"), error => error.code === "SUPPRESSION_VOLONTAIRE")
  await remove(h, { entity: "affiliation", family: "athlete", id: created.affiliation.id }, uuid(10))
  await remove(h, { entity: "actor", family: "athlete", id: created.athlete.idAthlete }, uuid(11))
  await assert.rejects(domain.runAthleteRegistration(h.createStore(), "U1", input, "2026-11-19"), error => error.code === "SUPPRESSION_VOLONTAIRE")
})
