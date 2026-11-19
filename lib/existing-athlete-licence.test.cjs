/* global require, Request */
/* eslint-disable @typescript-eslint/no-require-imports -- Controlled Sheets fixture. */
const test = require("node:test"), assert = require("node:assert/strict")
const { harness } = require("../tests/helpers/sports-harness.cjs")
test("an existing historical identity with no affiliation must remain discoverable", async () => {
  const h = harness({ onboarding: true, management: true })
  h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values.length = 1
  const result = await h.loadModule("lib/existing-athlete-licence.ts").existingAthleteLicenceOptions(h.createStore(), { clubId: "0101001", seasonId: "SAI006" }, "2026-05-01")
  assert.equal(result.actors.some(row => row.id === "ATH00001" && row.state === "NEEDS_AFFILIATION"), true, "missing affiliation must lead to explicit regularisation, not an invisible identity")
})
const input = { actorId: "ATH00001", clubId: "0101001", seasonId: "SAI006", affiliationDate: "01012026", confirmAffiliation: "true", idempotencyKey: "77777777-1111-4111-8111-111111111111" }
function setup(missing = true) {
  const h = harness({ onboarding: true, management: true })
  if (missing) h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values = [h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values[0]]
  return { ...h, service: h.loadModule("lib/existing-athlete-licence.ts") }
}
async function run(h, command = input) { return h.service.runExistingAthleteLicence(h.createStore(), "U1", command, "2026-05-01") }
test("historical identity, no metadata: affiliation and licence only, identity and actor metadata unchanged", async () => {
  const h = setup(), identity = JSON.stringify(h.books.ACT)
  const result = await run(h)
  assert.equal(result.state, "COMPLETE"); assert.equal(result.actorId, "ATH00001"); assert.equal(result.numeroLicence, "0101001001")
  assert.equal(result.affiliationCreated, true); assert.equal(JSON.stringify(h.books.ACT), identity)
  assert.equal(h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values.length, 2)
  assert.equal(h.books.LIC.sheets.ATHLETE_LICENCES.values.length, 2)
  const snapshot = await h.createStore().load(true)
  const clubIndex = h.loadModule("lib/club-actors-model.ts").buildClubActorIndex({ actors: { ATHLETES: snapshot.athletes }, affiliations: { ATHLETE_AFFILIATIONS: snapshot.affiliations }, references: { SEXES: snapshot.sexes, STATUTS_AFFILIATION: snapshot.affiliationStatuses } }, "2026-05-01", h.loadModule("lib/compact-date.ts").formatDateForSheet, "0101001")
  assert.ok(clubIndex.byClub["0101001"].athletes.some(row => row.id === input.actorId))
  assert.equal(h.loadModule("lib/active-actor-licences.ts").activeActorLicenceNumbers([result.licence], "2026-05-01").get(input.actorId), result.numeroLicence)
  assert.equal((await run(h)).affiliationId, result.affiliationId)
  assert.equal(h.books.LIC.sheets.ATHLETE_LICENCES.values.length, 2)
})
test("separately created active affiliation needs no identity receipt or new affiliation", async () => {
  const h = setup(false), before = JSON.stringify(h.books.AFF.sheets.ATHLETE_AFFILIATIONS)
  const result = await run(h, { ...input, affiliationDate: "", confirmAffiliation: "false" })
  assert.equal(result.affiliationCreated, false); assert.equal(result.affiliationId, "AFA-000001")
  assert.equal(JSON.stringify(h.books.AFF.sheets.ATHLETE_AFFILIATIONS), before); assert.equal(h.books.ACT.metadata.length, 0)
})
for (const status of ["SAF002", "SAF003", "SAF004"]) test(`historical affiliation ${status} is never replaced with a fake first affiliation`, async () => {
  const h = setup(false), sheet = h.books.AFF.sheets.ATHLETE_AFFILIATIONS
  sheet.values[1][5] = status; sheet.values[1][4] = "2026-02-01"
  await assert.rejects(run(h), error => error.code === "MOUVEMENT_REQUIS")
  assert.equal(h.calls.filter(call => call.business).length, 0)
})
test("active elsewhere, ambiguity, existing same season and other season", async () => {
  const h = setup(false)
  await assert.rejects(run(h, { ...input, clubId: "0101002" }), error => error.code === "TRANSFERT_REQUIS")
  const aff = h.books.AFF.sheets.ATHLETE_AFFILIATIONS
  aff.values.push([...aff.values[1]]); aff.values.at(-1)[0] = "AFA-X"
  await assert.rejects(run(h), error => error.code === "RATTACHEMENT_AMBIGU"); h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values.pop()
  await run(h)
  await assert.rejects(run(h, { ...input, idempotencyKey: "88888888-1111-4111-8111-111111111111" }), error => error.code === "LICENCE_EXISTANTE")
  const j = setup(false); j.books.LIC.sheets.ATHLETE_LICENCES.values.push(["OLD", "ATH00001", "OLD-SEASON", "OLD-AFF", "OLD-NUMBER", "2025-01-01", "STL001", "", "0101002", "1"])
  assert.equal((await run(j)).state, "COMPLETE")
})
test("required date, explicit confirmation, club, season, reserved history and read failure have no business writes", async () => {
  for (const changes of [{ affiliationDate: "" }, { affiliationDate: "31022026" }, { confirmAffiliation: "false" }, { clubId: "UNKNOWN" }, { seasonId: "UNKNOWN" }]) {
    const h = setup(); await assert.rejects(run(h, { ...input, ...changes })); assert.equal(h.calls.filter(call => call.business).length, 0)
  }
  const h = setup(); h.books.LIC.metadata.push({ metadataId: 100, metadataKey: "fevoco:sports:v1:athlete-season:ATH00001:SAI006", metadataValue: "{}" })
  await assert.rejects(run(h), error => error.code === "DELIVRANCE_RESERVEE"); assert.equal(h.calls.filter(call => call.business).length, 0)
  const j = setup(); j.state.failReadBook = "AFF"; await assert.rejects(run(j)); assert.equal(j.calls.filter(call => call.business).length, 0)
})
for (const book of ["AFF", "LIC"]) test(`recovery after failure at ${book}, same identity and affiliation`, async () => {
  const h = setup(); h.state.rejectBook = book
  await assert.rejects(run(h)); h.state.rejectBook = ""
  const result = await run(h)
  assert.equal(result.state, "COMPLETE"); assert.equal(h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values.length, 2); assert.equal(h.books.LIC.sheets.ATHLETE_LICENCES.values.length, 2)
})
for (const book of ["AFF", "LIC"]) test(`lost acknowledgement ${book} is checked before repeating`, async () => {
  const h = setup(); h.state.failAfterBook = book
  await assert.rejects(run(h)); h.state.failAfterBook = ""; h.state.hideGetBook = ""; h.state.hideReceiptBook = ""
  assert.equal((await run(h)).state, "COMPLETE"); assert.equal(h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values.length, 2); assert.equal(h.books.LIC.sheets.ATHLETE_LICENCES.values.length, 2)
})
test("legitimate lock and API permissions/origin", async () => {
  const h = setup(), op = h.operation("99999999-1111-4111-8111-111111111111", { purpose: "another" })
  await h.createStore().acquire(["ATH00001"], op)
  await assert.rejects(run(h), error => error.code === "ATHLETE_RESERVE" && error.state === "REJECTED")
  assert.equal(h.calls.filter(call => call.business).length, 0)
  const route = h.loadModule("app/api/licences/athletes/existing/route.ts")
  for (const flag of ["noSession", "activation", "denyWrite"]) {
    h.state[flag] = true
    const response = await route.POST(new Request("http://localhost/api/licences/athletes/existing", { method: "POST", headers: { origin: "http://localhost" }, body: JSON.stringify(input) }))
    assert.equal(response.status, flag === "denyWrite" ? 403 : 401); h.state[flag] = false
  }
})
test("concurrent repeats produce one business result and no identity write", async () => {
  const h = setup(), before = JSON.stringify(h.books.ACT)
  const results = await Promise.allSettled([run(h), run(h)])
  assert.ok(results.some(result => result.status === "fulfilled"))
  await run(h)
  assert.equal(h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values.length, 2)
  assert.equal(h.books.LIC.sheets.ATHLETE_LICENCES.values.length, 2)
  assert.equal(JSON.stringify(h.books.ACT), before)
})
