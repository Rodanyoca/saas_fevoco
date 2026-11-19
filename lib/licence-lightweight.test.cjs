/* global require, console */
/* eslint-disable @typescript-eslint/no-require-imports -- Controlled Sheets fixture. */
const test = require("node:test"), assert = require("node:assert/strict")
const { harness } = require("../tests/helpers/sports-harness.cjs")
test("licence options use at most seven Google reads and do not gate on season opening or territorial parents", async () => {
  const h = harness({ onboarding: true, management: true })
  h.books.REF.sheets.SAISON.values[1][3] = "STS005"
  const service = h.loadModule("lib/existing-athlete-licence.ts")
  const result = await service.existingAthleteLicenceOptions(h.createStore(), { clubId: "0101001" }, "2026-05-01")
  console.log(JSON.stringify({ optionsReads: h.reads.length }))
  assert.equal(result.actors.find(row => row.id === "ATH00001").state, "READY")
  assert.ok(h.reads.length <= 7)
})
test("affiliation reads skip counters and unrelated reference sheets", async () => {
  const h = harness({ onboarding: true, management: true })
  const snapshot = await h.createStore().load("affiliation")
  console.log(JSON.stringify({ affiliationReads: h.reads.length }))
  assert.equal(h.reads.length, 6)
  assert.equal(snapshot.counters.length, 0)
  assert.equal(h.reads.some(read => read.ranges?.some(range => range.includes("COMPTEURS_LICENCES"))), false)
})
test("delivery needs one fresh snapshot, keeps automatic numbering and ignores closed season status", async () => {
  const h = harness({ onboarding: true, management: true })
  h.books.REF.sheets.SAISON.values[1][3] = "STS005"
  const service = h.loadModule("lib/existing-athlete-licence.ts")
  const result = await service.runExistingAthleteLicence(h.createStore(), "U1", { actorId: "ATH00001", clubId: "0101001", seasonId: "SAI006", affiliationDate: "", confirmAffiliation: "false", idempotencyKey: "77777777-1111-4111-8111-111111111111" }, "2026-05-01")
  const referenceReads = h.reads.filter(read => read.book === "REF").length
  console.log(JSON.stringify({ deliveryReads: h.reads.length, referenceReads }))
  assert.equal(referenceReads, 1)
  assert.equal(result.numeroLicence, "0101001001")
})
test("confirmed orphaned reservation is replaced atomically, old number and identifier stay reserved", async () => {
  const h = harness({ onboarding: true, management: true })
  const old = (await h.run())[0]
  const oldReservations = h.books.LIC.metadata.filter(item => item.metadataKey.includes(":number:") || item.metadataKey.includes(":record:ATHLETE_LICENCES:")).map(item => item.metadataKey)
  h.books.LIC.sheets.ATHLETE_LICENCES.values.length = 1
  const service = h.loadModule("lib/existing-athlete-licence.ts")
  const options = await service.existingAthleteLicenceOptions(h.createStore(), { clubId: "0101001" }, "2026-05-01")
  assert.equal(options.actors.find(row => row.id === "ATH00001").state, "READY")
  const command = { actorId: "ATH00001", clubId: "0101001", seasonId: "SAI006", affiliationDate: "", confirmAffiliation: "false", idempotencyKey: "77777777-1111-4111-8111-111111111111" }
  const reservation = h.books.LIC.metadata.find(item => item.metadataKey.includes(":athlete-season:ATH00001:"))
  h.state.rejectBook = "LIC"
  await assert.rejects(service.runExistingAthleteLicence(h.createStore(), "U1", command, "2026-05-01"))
  assert.equal(h.books.LIC.metadata.find(item => item.metadataId === reservation.metadataId).metadataValue, reservation.metadataValue)
  h.state.rejectBook = ""; h.state.failAfterBook = "LIC"
  await assert.rejects(service.runExistingAthleteLicence(h.createStore(), "U1", command, "2026-05-01"))
  h.state.failAfterBook = ""; h.state.hideReceiptBook = ""; h.state.hideGetBook = ""
  const result = await service.runExistingAthleteLicence(h.createStore(), "U1", command, "2026-05-01")
  assert.equal(result.numeroLicence, "0101001002")
  assert.notEqual(result.licence.idLicence, old.id_licence)
  for (const key of oldReservations) assert.ok(h.books.LIC.metadata.some(item => item.metadataKey === key))
  await assert.rejects(h.run(), error => error.code === "SUPPRESSION_VOLONTAIRE")
  assert.equal(h.books.LIC.sheets.COMPTEURS_LICENCES.values[1][3], "2")
})
test("reservation without a confirmed receipt or with an active owner is never cleared", async () => {
  for (const active of [false, true]) {
    const h = harness({ onboarding: true, management: true })
    if (active) {
      await h.run(); h.books.LIC.sheets.ATHLETE_LICENCES.values.length = 1
      await h.createStore().acquire(["ATH00001"], h.operation("11111111-1111-4111-8111-111111111111", { unknown: "pending" }))
    } else h.books.LIC.metadata.push({ metadataId: 500, metadataKey: "fevoco:sports:v1:athlete-season:ATH00001:SAI006", metadataValue: JSON.stringify({ id: "unknown", fingerprint: "unknown" }) })
    const before = JSON.stringify(h.books.LIC)
    const options = await h.loadModule("lib/existing-athlete-licence.ts").existingAthleteLicenceOptions(h.createStore(), { clubId: "0101001" }, "2026-05-01")
    assert.equal(options.actors.find(row => row.id === "ATH00001").state, "RESERVED")
    assert.equal(JSON.stringify(h.books.LIC), before)
  }
})
