/* global require, Request */
/* eslint-disable @typescript-eslint/no-require-imports -- Real options service with controlled Sheets transport. */
const test = require("node:test"), assert = require("node:assert/strict")
const { harness } = require("../tests/helpers/sports-harness.cjs")
const selection = { clubId: "0101001", seasonId: "SAI006", date: "2026-05-01" }
const setup = () => {
  const h = harness({ onboarding: true, management: true })
  return { ...h, options: h.loadModule("lib/athlete-licence-creation.ts").athleteLicenceCreationOptions }
}
test("selector excludes same-season licences across all clubs and retains an unlicensed athlete", async () => {
  const h = harness({ onboarding: true, management: true })
  await h.run()
  const service = h.loadModule("lib/athlete-licence-creation.ts")
  const options = await service.athleteLicenceCreationOptions({ clubId: "0101001", seasonId: "SAI006", date: "2026-05-01" })
  assert.equal(options.candidates.some(item => item.athleteId === "ATH00001"), false, "already licensed athlete must disappear")
  assert.equal(options.candidates.some(item => item.athleteId === "ATH00002"), true, "unlicensed athlete remains selectable")
})

for (const status of ["STL001", "STL002", "STL003", "STL004", "STL005"]) test(`same-season licence ${status} excludes regardless of attribution club`, async () => {
  const h = setup(); await h.run()
  const sheet = h.books.LIC.sheets.ATHLETE_LICENCES, header = sheet.values[0]
  sheet.values[1][header.indexOf("id_statut_licence")] = status
  sheet.values[1][header.indexOf("id_club_attribution")] = "0101002"
  const result = await h.options(selection)
  assert.equal(result.candidates.some(row => row.athleteId === "ATH00001"), false)
})
test("other season does not exclude; duplicate active affiliations, inactive and other club do", async () => {
  const h = setup(); await h.run()
  const sheet = h.books.LIC.sheets.ATHLETE_LICENCES
  sheet.values[1][sheet.values[0].indexOf("id_saison")] = "OLD"
  for (const item of h.books.LIC.metadata) item.metadataKey = item.metadataKey.replace("athlete-season:ATH00001:SAI006", "athlete-season:ATH00001:OLD")
  assert.equal((await h.options(selection)).candidates.some(row => row.athleteId === "ATH00001"), true)
  const aff = h.books.AFF.sheets.ATHLETE_AFFILIATIONS
  aff.values.push([...aff.values[2]]); aff.values.at(-1)[0] = "NEXT"; aff.values.at(-1)[2] = "0101002"
  assert.equal((await h.options(selection)).candidates.some(row => row.athleteId === "ATH00002"), false)
  for (const status of ["SAF002", "SAF003", "SAF004"]) {
    aff.values[1][5] = status
    assert.equal((await h.options(selection)).candidates.some(row => row.athleteId === "ATH00001"), false)
  }
})
test("licence read failure is unavailable, persistent operations and historical claims are blockers", async () => {
  const h = setup()
  h.state.failReadBook = "LIC"; await assert.rejects(h.options(selection)); h.state.failReadBook = ""
  h.books.AFF.metadata.push({ metadataId: 123, metadataKey: "fevoco:sports:v1:lock:ATH00001", metadataValue: JSON.stringify({ id: "partial", fingerprint: "partial" }) })
  h.books.LIC.metadata.push({ metadataId: 124, metadataKey: "fevoco:sports:v1:athlete-season:ATH00002:SAI006", metadataValue: JSON.stringify({ id: "old", fingerprint: "old" }) })
  const before = JSON.stringify(h.books), result = await h.options(selection)
  assert.equal(result.candidates.length, 0); assert.equal(JSON.stringify(h.books), before)
  assert.ok(result.conflicts.some(row => row.code === "DELIVRANCE_RESERVEE"))
  assert.ok(result.conflicts.some(row => row.code === "ATHLETE_RESERVE"))
})
test("concurrent delivery after preview is refused before another number or business batch", async () => {
  const h = setup()
  assert.equal((await h.options(selection)).candidates.length, 2)
  await h.run()
  const before = JSON.stringify(h.books.LIC.sheets), writes = h.calls.filter(call => call.business).length
  await assert.rejects(h.run("ATH00001", "99999999-1111-4111-8111-111111111111"), error => error.code === "LICENCE_EXISTANTE")
  assert.equal(JSON.stringify(h.books.LIC.sheets), before)
  assert.equal(h.calls.filter(call => call.business).length, writes)
})
test("API permissions and origin are enforced before any candidate or mutation read", async () => {
  const h = setup(), route = h.loadModule("app/api/licences/athletes/route.ts")
  for (const flag of ["noSession", "activation", "denyWrite"]) {
    h.state[flag] = true
    const before = h.reads.length
    const response = await route.GET(new Request("http://localhost/api/licences/athletes?club=0101001&season=SAI006&date=2026-05-01"))
    assert.equal(response.status, flag === "denyWrite" ? 403 : 401); assert.equal(h.reads.length, before); h.state[flag] = false
  }
  assert.equal((await route.POST(new Request("http://localhost/api/licences/athletes", { method: "POST", body: "{}" }))).status, 403)
})
test("read cost is constant for two or two hundred candidates; no reservation consumed", async () => {
  const h = setup(); const start = h.reads.length
  await h.options(selection); const first = h.reads.length - start
  const aff = h.books.AFF.sheets.ATHLETE_AFFILIATIONS, actors = h.books.ACT.sheets.ATHLETES
  for (let n = 3; n <= 200; n++) {
    aff.values.push(["AFA-" + n, "ATH-" + n, "0101001", "2026-01-01", "", "SAF001", "", "TRF001", ""])
    actors.values.push(actors.values[0].map(key => key === "id_athlete" ? "ATH-" + n : key === "nom_complet" ? "Test " + n : ""))
  }
  const next = h.reads.length, result = await h.options(selection)
  assert.equal(result.candidates.length, 200); assert.equal(h.reads.length - next, first)
  assert.equal(h.calls.length, 0)
})
test("a completed-operation lock is recoverable without releasing number claims; a missing result is not", async () => {
  const h = setup(), rows = await h.run(), receipt = h.books.LIC.metadata.find(item => item.metadataKey.includes(":athlete-season:ATH00001:")), operation = JSON.parse(receipt.metadataValue)
  h.books.AFF.metadata.push({ metadataId: 125, metadataKey: "fevoco:sports:v1:lock:ATH00001", metadataValue: receipt.metadataValue, visibility: "DOCUMENT" })
  const store = h.createStore(), before = JSON.stringify(h.books.LIC.metadata)
  assert.equal((await store.completed("licences", operation))[0].id_licence, rows[0].id_licence)
  // The existing conditional-release protocol uses deterministic lock IDs; use its actual acquired lease for this fixture.
  await store.release({ owner: receipt.metadataValue, items: [{ id: 125, key: "fevoco:sports:v1:lock:ATH00001" }] })
  assert.equal(h.books.AFF.metadata.some(item => item.metadataKey.includes(":lock:ATH00001")), false)
  assert.equal(JSON.stringify(h.books.LIC.metadata), before)
  h.books.LIC.sheets.ATHLETE_LICENCES.values[1] = []
  await assert.rejects(store.completed("licences", operation), error => error.code === "RESULTAT_INCOHERENT")
  assert.equal((await h.options(selection)).candidates.some(item => item.athleteId === "ATH00001"), false)
})
