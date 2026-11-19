/* global module, Response, Request, Headers, URL, require, __dirname, console, process, setTimeout, clearTimeout, structuredClone */
/* eslint-disable @typescript-eslint/no-require-imports -- Real server modules, isolated synthetic Google API. */
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm"), ts = require("typescript")

function harness({ onboarding = false, management = false, overrides = {} } = {}) {
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
  if (onboarding) {
    const actorHeaders = ["id_athlete", "id_national", "id_fivb", "nom_complet", "id_sexe", "date_de_naissance", "lieu_de_naissance", "nationalite", "telephone", "email", "adresse", "statut", "observations", "avatar_drive_id", "avatar_drive_url"]
    books.ACT.sheets.ATHLETES.values = [actorHeaders, ...["ATH00001", "ATH00002"].map((id, index) => actorHeaders.map(key => ({ id_athlete: id, nom_complet: `Existing ${index}`, id_sexe: "SEX001", statut: "ACTIF" })[key] || ""))]
    books.TERR.sheets.CLUBS.values = [["id_club", "nom_club", "id_entente", "statut"], ["0101001", "Club Alpha", "ENT1", "ACTIF"], ["0101002", "Club Beta", "ENT1", "ACTIF"]]
    books.TERR.sheets.ENTENTES = { id: 2, values: [["id_entente", "nom_entente", "id_ligue", "statut"], ["ENT1", "Entente", "LIG1", "ACTIF"]] }
    books.TERR.sheets.LIGUES = { id: 3, values: [["id_ligue", "nom_ligue", "statut"], ["LIG1", "Ligue", "ACTIF"]] }
    books.REF.sheets.SAISON.values[0].push("id_statut_saison"); books.REF.sheets.SAISON.values[1].push("STS002")
    books.REF.sheets.SEXES = { id: 5, values: [["id_sexe", "nom_sexe"], ["SEX001", "MASCULIN"], ["SEX002", "FEMININ"]] }
    books.REF.sheets.STATUTS_SAISON = { id: 6, values: [["id_statut_saison", "nom_statut"], ["STS002", "ACTIVE"], ["STS005", "ANNULEE"]] }
    books.REF.sheets.STATUTS_AFFILIATION = { id: 7, values: [["id_statut_affiliation", "nom_statut_affiliation"], ["SAF001", "ACTIF"]] }
    books.REF.sheets.PARAMETRES_SYSTEME.values.push(["SAISON_COURANTE", "SAI006"])
  }
  if (management) {
    for (const [book, table] of [["COMP", "COMPETITIONS_INTERVENANTS"], ["NAT", "STAFFS"], ["ACTIVITY", "ACTIVITES_PARTICIPANTS"], ["DOC", "DOCUMENTS_RELATIONS"]]) books[book] = { metadata: [], sheets: { [table]: { id: 1, values: [["id", "id_type_acteur", "id_acteur", "id_entite", "id_licence"]] } } }
    books.LIC.sheets.ACTEURS_LICENCES = { id: 3, values: [["id_licence", "id_type_acteur", "id_acteur", "id_affiliation_acteur", "numero_licence"]] }
    for (const [table, id] of [["COACHS", "id_coach"], ["ARBITRES", "id_arbitre"], ["MEDECINS", "id_medecin"], ["OFFICIELS", "id_officiel"], ["AUTRES", "id_autre_acteur"]]) books.ACT.sheets[table] ||= { id: Object.keys(books.ACT.sheets).length + 1, values: [[id, "nom_complet", "statut"]] }
  }
  const reads = [], invalidations = []
  const calls = [], state = { failAfterApply: false, hideReceipt: false, failBeforeApply: false, rejectBeforeApply: false }
  const failure = (message, status) => Object.assign(new Error(message), { response: status ? { status } : undefined })
  const matches = (m, f) => Object.entries(f).every(([key, value]) => m[key] === value)
  const sheetName = range => range.split("!")[0].replaceAll("'", "")
  const readRange = (spreadsheetId, range) => {
    if (state.failReadBook === spreadsheetId) throw failure("source unavailable", 503)
    const values = books[spreadsheetId].sheets[sheetName(range)]?.values
    if (!values) throw failure("unknown range", 400)
    const part = range.split("!")[1]
    if (part === "1:1") return [values[0]]
    const match = part.match(/^([A-Z]+)2:\1$/)
    if (match) { const index = [...match[1]].reduce((v, c) => v * 26 + c.charCodeAt(0) - 64, 0) - 1; return values.slice(1).map(row => [row[index] || ""]) }
    return values
  }
  const client = { spreadsheets: {
    get: async ({ spreadsheetId, fields }) => { reads.push({ kind: "properties", book: spreadsheetId, fields }); if(state.hideGetBook === spreadsheetId || state.failReadBook === spreadsheetId) throw failure("source unavailable", 503); return ({ data: { developerMetadata: structuredClone(books[spreadsheetId].metadata), sheets: Object.entries(books[spreadsheetId].sheets).map(([title, s]) => ({ properties: { title, sheetId: s.id, gridProperties: { rowCount: 1000, columnCount: s.values[0].length } } })) } }) },
    values: { get: async ({spreadsheetId,range}) => ({data:{values:readRange(spreadsheetId,range)}}), batchGet: async ({ spreadsheetId, ranges }) => { reads.push({ kind: "values", book: spreadsheetId, ranges }); return ({ data: { valueRanges: ranges.map(range => ({ values: readRange(spreadsheetId, range) })) } }) } },
    developerMetadata: { search: async ({ spreadsheetId, requestBody }) => {
      reads.push({ kind: "metadata", book: spreadsheetId })
      if (state.hideReceiptBook === spreadsheetId) throw failure("read timeout")
      if (state.hideReceipt && spreadsheetId === "LIC") throw failure("read timeout")
      return { data: { matchedDeveloperMetadata: books[spreadsheetId].metadata.filter(m => requestBody.dataFilters.some(f => matches(m, f.developerMetadataLookup))).map(developerMetadata => ({ developerMetadata })) } }
    } },
    batchUpdate: async ({ spreadsheetId, requestBody }) => {
      const business = requestBody.requests.some(r => r.appendCells || r.updateCells)
      calls.push({ spreadsheetId, business, requests: requestBody.requests })
      if (business) await new Promise(resolve => setTimeout(resolve, 5)) // overlap two independent instances before atomic validation
      if (business && (state.failBeforeApply || state.failBook === spreadsheetId)) throw failure("network timeout")
      if (business && (state.rejectBeforeApply || state.rejectBook === spreadsheetId)) throw failure("invalid cell schema", 400)
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
          const action = r.appendCells || r.updateCells, sheet = Object.values(draft.sheets).find(s => s.id === (action.sheetId || action.start?.sheetId || action.range?.sheetId))
          const cell = c => c.userEnteredValue.stringValue ?? (c.userEnteredFormat?.numberFormat?.type === "DATE" ? new Date(Date.parse("1899-12-30T00:00:00Z") + c.userEnteredValue.numberValue * 86400000).toISOString().slice(0, 10) : c.userEnteredValue.numberValue)
          if (r.appendCells) sheet.values.push(...action.rows.map(row => row.values.map(cell)))
          else { const index = action.start?.rowIndex ?? action.range.startRowIndex; const start = action.start?.columnIndex ?? action.range.startColumnIndex; sheet.values[index] ||= []; action.rows[0].values.forEach((value, offset) => { sheet.values[index][start + offset] = cell(value) }) }
        }
      }
      books[spreadsheetId] = draft
      if (business && state.failAfterBook === spreadsheetId) { state.hideReceiptBook = spreadsheetId; if(management) state.hideGetBook = spreadsheetId; throw failure("acknowledgement lost") }
      if (business && state.failAfterApply) { state.hideReceipt = true; throw failure("acknowledgement lost") }
      return { data: { replies: requestBody.requests.map(() => ({})) } }
    },
  } }
  const root = path.resolve(__dirname, "../.."), modules = new Map()
  const mocks = { "server-only": {},
    "next/server": { NextResponse: { json: (body, options = {}) => new Response(JSON.stringify(body), options) } },
    "next/cache": { revalidatePath: path => invalidations.push({ path }) },
    "@/lib/auth": { getSession: async () => state.noSession ? null : { idUser: "U1", doitChangerMotDePasse: Boolean(state.activation) }, canAccess: async () => !state.denyWrite }, "@/lib/env": { env: { googleSheets: { affiliationsSpreadsheetId: "AFF", licencesSpreadsheetId: "LIC", territorialSpreadsheetId: "TERR", acteursSpreadsheetId: "ACT", referentielsSpreadsheetId: "REF", ...(management ? {competitionsSpreadsheetId:"COMP",equipeNationaleSpreadsheetId:"NAT",activitiesSpreadsheetId:"ACTIVITY",documentsSpreadsheetId:"DOC"} : {}), clientEmail: "fake", privateKey: "fake" } } }, "@/lib/google-sheets": { sportsSheetsClient: async () => client, getSheetsDataFrom: async (book, ranges) => {
      reads.push({ kind: "cached-values", book, ranges })
      return Object.fromEntries(ranges.map(range => { const name = sheetName(range), [headers, ...values] = books[book].sheets[name].values; return [name, values.map(row => Object.fromEntries(headers.map((key, index) => [key, row[index] || ""]))) ] }))
    }, invalidateSportsSheets(book, sheets) { invalidations.push({ book, sheets }) } } }
  if (!management) mocks["@/lib/business-write-guard"] = { withBusinessWrite: async run => run(), assertRecordsAlive: async () => {}, releaseBusinessGuard: async () => {}, isBusinessWriteActive: () => false, reservedBusinessIds: async () => [] }
  for (const [name, value] of Object.entries(overrides)) mocks[name] = { ...(mocks[name] || {}), ...value }
  function load(file) {
    file = path.resolve(file); if (modules.has(file)) return modules.get(file)
    const exports = {}; modules.set(file, exports)
    const source = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
    const req = name => name in mocks ? mocks[name] : name.startsWith("@/") ? load(path.join(root, name.slice(2) + ".ts")) : name.startsWith(".") ? load(path.resolve(path.dirname(file), name.endsWith(".ts") ? name : name + ".ts")) : require(name)
    vm.runInNewContext(source, { exports, require: req, process, console, setTimeout, clearTimeout, Response, Request, Headers, URL }, { filename: file })
    return exports
  }
  const { createGoogleSportsStore } = load(path.join(root, "lib/sports-atomic-store.ts")), { executeSportsMutation, mutateAthleteTransfer, mutateSeasonalLicence } = load(path.join(root, "lib/sports-mutations.ts")), { operation } = load(path.join(root, "lib/sports-model.ts")), { allocateSportsLicences } = load(path.join(root, "lib/sports-licences-domain.ts"))
  const run = (actor = "ATH00001", key = "11111111-1111-4111-8111-111111111111") => {
    const input = { id_athlete: actor, id_saison: "SAI006", id_affiliation_athlete: actor === "ATH00001" ? "AFA-000001" : "AFA-000002", date_delivrance: "2026-05-01", id_statut_licence: "STL001" }
    return executeSportsMutation(createGoogleSportsStore(), "licences", operation(key, input), [actor], s => allocateSportsLicences(s, input))
  }
  const { planAthleteTransfer } = load(path.join(root, "lib/athlete-transfers-domain.ts"))
  const runTransfer = () => { const input = { id_type_transfert: "TRF002", id_affiliation_precedente: "AFA-000001", id_club: "0101002", date_debut: "2026-06-01", date_fin: "2026-06-30", id_statut_affiliation: "SAF001" }; return executeSportsMutation(createGoogleSportsStore(), "affiliations", operation("44444444-4444-4444-8444-444444444444", input), ["ATH00001"], source => planAthleteTransfer(source, "ATH00001", input, "2026-06-01")) }
  return { loadModule: name => load(path.join(root, name)), books, state, calls, reads, invalidations, run, runTransfer, mutateAthleteTransfer, mutateSeasonalLicence, createStore: createGoogleSportsStore, operation }
}

module.exports = { harness }
