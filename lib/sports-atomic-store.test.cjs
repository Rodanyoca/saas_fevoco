/* global require, __dirname, console, process, setTimeout, clearTimeout, structuredClone */
/* eslint-disable @typescript-eslint/no-require-imports -- Real server modules, isolated synthetic Google API. */
const test = require("node:test"), assert = require("node:assert/strict")
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm"), ts = require("typescript")

function harness() {
  const headers = {
    ATHLETE_AFFILIATIONS: ["id_affiliation_athlete", "id_athlete", "id_club", "date_debut", "date_fin", "id_statut_affiliation", "observations", "id_type_transfert", "id_affiliation_precedente"],
    ATHLETE_LICENCES: ["id_licence", "id_athlete", "id_saison", "id_affiliation_athlete", "numero_licence", "date_delivrance", "id_statut_licence", "observations", "id_club_attribution", "compteur_saison"],
    COMPTEURS_LICENCES: ["id_compteur_licence", "id_club", "id_saison", "dernier_compteur", "statut_compteur", "observations"],
  }
  const rows = {
    AFF: { ATHLETE_AFFILIATIONS: [headers.ATHLETE_AFFILIATIONS, ["AFA-000001", "ATH00001", "0101001", "2026-01-01", "", "SAF001", "", "", ""], ["AFA-000002", "ATH00002", "0101001", "2026-01-01", "", "SAF001", "", "", ""]] },
    LIC: { ATHLETE_LICENCES: [headers.ATHLETE_LICENCES], COMPTEURS_LICENCES: [headers.COMPTEURS_LICENCES] },
    TERR: { CLUBS: [["id_club"], ["0101001"], ["0101002"]] },
    ACT: { ATHLETES: [["id_athlete"], ["ATH00001"], ["ATH00002"]] },
    REF: { SAISON: [["id_saison", "date_debut", "date_fin"], ["SAI006", "2026-01-01", "2026-12-31"]], STATUT_LICENCE: [["id_statut_licence"], ["STL001"]], TYPES_TRANSFERT: [["id_type_transfert"], ["TRF001"], ["TRF002"], ["TRF003"]], PARAMETRES_SYSTEME: [["cle_parametre", "valeur_parametre"], ["TRANSFERT_AFFILIATION_SANS_CHEVAUCHEMENT", "TRUE"], ["LICENCE_SPORTIVE_NUMEROTATION", "CLUB_COMPTEUR_SAISON"], ["LICENCE_SPORTIVE_TRANSFERT_CONSERVATION", "TRUE"]] },
  }
  const books = Object.fromEntries(Object.entries(rows).map(([id, sheets]) => [id, { metadata: [], sheets: Object.fromEntries(Object.entries(sheets).map(([name, values], i) => [name, { id: i + 1, values }])) }]))
  const calls = [], state = { failAfterApply: false, hideReceipt: false, failBeforeApply: false, rejectBeforeApply: false }
  const failure = (message, status) => Object.assign(new Error(message), { response: status ? { status } : undefined })
  const matches = (m, f) => Object.entries(f).every(([key, value]) => m[key] === value)
  const sheetName = range => range.split("!")[0].replaceAll("'", "")
  const client = { spreadsheets: {
    get: async ({ spreadsheetId }) => ({ data: { sheets: Object.entries(books[spreadsheetId].sheets).map(([title, s]) => ({ properties: { title, sheetId: s.id, gridProperties: { rowCount: 1000, columnCount: s.values[0].length } } })) } }),
    values: { batchGet: async ({ spreadsheetId, ranges }) => ({ data: { valueRanges: ranges.map(range => ({ values: books[spreadsheetId].sheets[sheetName(range)].values })) } }) },
    developerMetadata: { search: async ({ spreadsheetId, requestBody }) => {
      if (state.hideReceipt && spreadsheetId === "LIC") throw failure("read timeout")
      return { data: { matchedDeveloperMetadata: books[spreadsheetId].metadata.filter(m => requestBody.dataFilters.some(f => matches(m, f.developerMetadataLookup))).map(developerMetadata => ({ developerMetadata })) } }
    } },
    batchUpdate: async ({ spreadsheetId, requestBody }) => {
      const business = requestBody.requests.some(r => r.appendCells || r.updateCells)
      calls.push({ spreadsheetId, business, requests: requestBody.requests })
      if (business) await new Promise(resolve => setTimeout(resolve, 5)) // overlap two independent instances before atomic validation
      if (business && state.failBeforeApply) throw failure("network timeout")
      if (business && state.rejectBeforeApply) throw failure("invalid cell schema", 400)
      const draft = structuredClone(books[spreadsheetId])
      for (const r of requestBody.requests) {
        if (r.createDeveloperMetadata) {
          const m = r.createDeveloperMetadata.developerMetadata
          if (draft.metadata.some(item => item.metadataId === m.metadataId)) throw failure("metadata ID already in use", 400)
          draft.metadata.push(m)
        } else if (r.deleteDeveloperMetadata) {
          const filter = r.deleteDeveloperMetadata.dataFilter.developerMetadataLookup
          draft.metadata = draft.metadata.filter(m => !matches(m, filter))
        } else {
          const action = r.appendCells || r.updateCells, sheet = Object.values(draft.sheets).find(s => s.id === (action.sheetId || action.start.sheetId))
          const cell = c => c.userEnteredValue.stringValue ?? (c.userEnteredFormat?.numberFormat?.type === "DATE" ? new Date(Date.parse("1899-12-30T00:00:00Z") + c.userEnteredValue.numberValue * 86400000).toISOString().slice(0, 10) : c.userEnteredValue.numberValue)
          if (r.appendCells) sheet.values.push(...action.rows.map(row => row.values.map(cell)))
          else { const index = action.start.rowIndex; sheet.values[index] ||= []; sheet.values[index][action.start.columnIndex] = cell(action.rows[0].values[0]) }
        }
      }
      books[spreadsheetId] = draft
      if (business && state.failAfterApply) { state.hideReceipt = true; throw failure("acknowledgement lost") }
      return { data: { replies: requestBody.requests.map(() => ({})) } }
    },
  } }
  const root = path.resolve(__dirname, ".."), modules = new Map()
  const mocks = { "server-only": {}, "@/lib/env": { env: { googleSheets: { affiliationsSpreadsheetId: "AFF", licencesSpreadsheetId: "LIC", territorialSpreadsheetId: "TERR", acteursSpreadsheetId: "ACT", referentielsSpreadsheetId: "REF", clientEmail: "fake", privateKey: "fake" } } }, "@/lib/google-sheets": { sportsSheetsClient: async () => client, invalidateSportsSheets() {} } }
  function load(file) {
    file = path.resolve(file); if (modules.has(file)) return modules.get(file)
    const exports = {}; modules.set(file, exports)
    const source = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
    const req = name => name in mocks ? mocks[name] : name.startsWith("@/") ? load(path.join(root, name.slice(2) + ".ts")) : name.startsWith(".") ? load(path.resolve(path.dirname(file), name.endsWith(".ts") ? name : name + ".ts")) : require(name)
    vm.runInNewContext(source, { exports, require: req, process, console, setTimeout, clearTimeout }, { filename: file })
    return exports
  }
  const { createGoogleSportsStore } = load(path.join(root, "lib/sports-atomic-store.ts")), { executeSportsMutation, mutateAthleteTransfer, mutateSeasonalLicence } = load(path.join(root, "lib/sports-mutations.ts")), { operation } = load(path.join(root, "lib/sports-model.ts")), { allocateSportsLicences } = load(path.join(root, "lib/sports-licences-domain.ts"))
  const run = (actor = "ATH00001", key = "11111111-1111-4111-8111-111111111111") => {
    const input = { id_athlete: actor, id_saison: "SAI006", id_affiliation_athlete: actor === "ATH00001" ? "AFA-000001" : "AFA-000002", date_delivrance: "2026-05-01", id_statut_licence: "STL001" }
    return executeSportsMutation(createGoogleSportsStore(), "licences", operation(key, input), [actor], s => allocateSportsLicences(s, input))
  }
  const { planAthleteTransfer } = load(path.join(root, "lib/athlete-transfers-domain.ts"))
  const runTransfer = () => { const input = { id_type_transfert: "TRF002", id_affiliation_precedente: "AFA-000001", id_club: "0101002", date_debut: "2026-06-01", date_fin: "2026-06-30", id_statut_affiliation: "SAF001" }; return executeSportsMutation(createGoogleSportsStore(), "affiliations", operation("44444444-4444-4444-8444-444444444444", input), ["ATH00001"], source => planAthleteTransfer(source, "ATH00001", input, "2026-06-01")) }
  return { books, state, calls, run, runTransfer, mutateAthleteTransfer, mutateSeasonalLicence, createStore: createGoogleSportsStore, operation }
}

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
