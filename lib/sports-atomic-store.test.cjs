/* global require, process */
/* eslint-disable @typescript-eslint/no-require-imports -- Isolated Google API regression tests. */
const test = require("node:test"), assert = require("node:assert/strict")
const { harness } = require("../tests/helpers/sports-harness.cjs")

test("premiere affiliation : ne reutilise pas les identifiants reserves dont les lignes sont absentes", async () => {
  const h = harness()
  h.books.ACT.sheets.ATHLETES.values.push(["ATH00003"])
  const previous = [3, 4, 5].map(n => ({ metadataId: 10000 + n, metadataKey: `fevoco:sports:v1:record:ATHLETE_AFFILIATIONS:AFA-${String(n).padStart(6, "0")}`, metadataValue: "historical", visibility: "DOCUMENT" }))
  h.books.AFF.metadata.push(...previous)
  const result = await h.mutateAthleteTransfer("ATH00003", { id_type_transfert: "TRF001", id_club: "0101001", date_debut: "2026-11-18", date_fin: "", id_statut_affiliation: "SAF001", idempotency_key: "77777777-7777-4777-8777-777777777777" })
  assert.equal(result.id_affiliation_athlete, "AFA-000006")
  assert.equal(h.calls.filter(call => call.business).length, 1)
  for (const reservation of previous) assert.ok(h.books.AFF.metadata.some(item => item.metadataKey === reservation.metadataKey))
  assert.equal(h.books.AFF.metadata.filter(item => item.metadataKey.includes("lock:")).length, 0)
})

test("licence : ne reutilise pas un identifiant technique reserve sans ligne", async () => {
  const h = harness()
  h.books.LIC.metadata.push({ metadataId: 12001, metadataKey: "fevoco:sports:v1:record:ATHLETE_LICENCES:VOL-LIC-2026-000003", metadataValue: "historical", visibility: "DOCUMENT" })
  const result = await h.run()
  assert.equal(result[0].id_licence, "VOL-LIC-2026-000004")
  assert.equal(result[0].numero_licence, "0101001001")
  assert.equal(h.calls.filter(call => call.business).length, 1)
})

test("deux instances et deux athlètes : compteur et identifiants techniques uniques", async () => {
  const h = harness()
  const [a, b] = await Promise.all([h.run(), h.run("ATH00002", "22222222-2222-4222-8222-222222222222")])
  assert.deepEqual([a[0].numero_licence, b[0].numero_licence].sort(), ["0101001001", "0101001002"])
  assert.notEqual(a[0].id_licence, b[0].id_licence)
  assert.equal(h.books.LIC.sheets.COMPTEURS_LICENCES.values[1][3], "2")
  assert.equal(h.books.AFF.metadata.filter(m => m.metadataKey.includes("lock:")).length, 0)
})
test("double soumission : une attribution, reprise du reçu sans nouvelle ligne", async () => {
  const h = harness(), results = await Promise.allSettled([h.run(), h.run()])
  assert.equal(results.filter(r => r.status === "fulfilled").length, 1)
  const replay = await h.run()
  assert.equal(replay[0].numero_licence, "0101001001")
  assert.equal(h.books.LIC.sheets.ATHLETE_LICENCES.values.length, 2)
})
test("lot refusé : ni licence ni compteur partiel", async () => {
  const h = harness(); h.state.rejectBeforeApply = true
  await assert.rejects(h.run(), /refusé/)
  assert.equal(h.books.LIC.sheets.ATHLETE_LICENCES.values.length, 1)
  assert.equal(h.books.LIC.sheets.COMPTEURS_LICENCES.values.length, 1)
})
test("réponse perdue après application : issue inconnue puis reprise confirmée, sans doublon", async () => {
  const h = harness(); h.state.failAfterApply = true
  await assert.rejects(h.run(), /non confirmé/)
  assert.equal(h.books.AFF.metadata.filter(m => m.metadataKey.includes("lock:")).length, 1)
  h.state.failAfterApply = false; h.state.hideReceipt = false
  const result = await h.run()
  assert.equal(result[0].numero_licence, "0101001001")
  assert.equal(h.books.LIC.sheets.ATHLETE_LICENCES.values.length, 2)
  assert.equal(h.books.AFF.metadata.filter(m => m.metadataKey.includes("lock:")).length, 0)
})
test("sans reçu, une issue inconnue ne se rejoue pas et n'expire pas automatiquement", async () => {
  const h = harness(); h.state.failBeforeApply = true
  await assert.rejects(h.run(), /non confirmé/)
  const calls = h.calls.filter(c => c.business).length
  h.state.failBeforeApply = false
  await assert.rejects(h.run(), /en cours ou d’issue inconnue/)
  assert.equal(h.calls.filter(c => c.business).length, calls)
  assert.equal(h.books.LIC.sheets.ATHLETE_LICENCES.values.length, 1)
})
test("une ancienne libération ne supprime jamais le verrou d'un nouveau propriétaire", async () => {
  const h = harness(); await h.run()
  const store = h.createStore(), owner = h.operation("33333333-3333-4333-8333-333333333333", {})
  const lease = await store.acquire(["ATH00001"], owner)
  await store.recoverCompleted(["ATH00001"], h.operation("11111111-1111-4111-8111-111111111111", {}))
  assert.equal(h.books.AFF.metadata.filter(m => m.metadataValue === JSON.stringify(owner)).length, 1)
  await store.release(lease)
})


test("cession : trois segments dans un seul lot, refus sans écriture partielle", async () => {
  const h = harness(); h.state.rejectBeforeApply = true
  await assert.rejects(h.runTransfer(), /refusé/)
  assert.equal(h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values.length, 3)
  assert.equal(h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values[1][4], "")
  h.state.rejectBeforeApply = false; await h.runTransfer()
  assert.equal(h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values.length, 5)
  assert.equal(h.books.AFF.sheets.ATHLETE_AFFILIATIONS.values[1][4], "2026-05-31")
  assert.equal(h.calls.filter(call => call.business).length, 2)
})

test("sans variable d’activation : attribution sportive disponible avec le protocole atomique", async () => {
  const previous = process.env.FEVOCO_SPORTS_ATOMIC_WRITES_ENABLED
  delete process.env.FEVOCO_SPORTS_ATOMIC_WRITES_ENABLED
  try {
    const h = harness()
    const result = await h.mutateSeasonalLicence({ id_athlete: "ATH00001", id_saison: "SAI006", id_affiliation_athlete: "AFA-000001", date_delivrance: "2026-05-01", id_statut_licence: "STL001", idempotency_key: "55555555-5555-4555-8555-555555555555" })
    assert.equal(result[0].numero_licence, "0101001001")
    assert.equal(h.calls.filter(call => call.business).length, 1)
    const transfer = await h.mutateAthleteTransfer("ATH00001", { id_type_transfert: "TRF003", id_affiliation_precedente: "AFA-000001", id_club: "0101002", date_debut: "2026-06-01", date_fin: "", id_statut_affiliation: "SAF001", idempotency_key: "66666666-6666-4666-8666-666666666666" })
    assert.equal(transfer.id_club, "0101002")
    assert.equal(h.calls.filter(call => call.business).length, 2)
  }
  finally { if (previous !== undefined) process.env.FEVOCO_SPORTS_ATOMIC_WRITES_ENABLED = previous }
})
