/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports -- Banc CommonJS qui remplace le transport Sheets avant de charger les modules TypeScript. */
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm")
const assert = require("node:assert/strict"), test = require("node:test"), ts = require("typescript")

// Exécute les routes et le service réels ; seul le transport Sheets est simulé.
function harness() {
  const root = path.resolve(__dirname, ".."), cache = new Map(), writes = [], formats = [], invalidated = []
  const data = {
    LIC: { ACTEURS_LICENCES: [] },
    ACT: { COACHS: [{ id_coach: "CO1", nom_complet: "Coach de test" }], ARBITRES: [{ id_arbitre: "AR1", nom_complet: "Arbitre de test" }], MEDECINS: [{ id_medecin: "ME1", nom_complet: "Médecin de test" }], OFFICIELS: [{ id_officiel: "OF1", nom_complet: "Officiel de test" }] },
    AFF: { COACH_AFFILIATIONS: [{ id_affiliation_coach: "AF1", id_coach: "CO1", id_club: "CL1", date_debut: "45323", id_statut_affiliation: "SAF001" }], MEDECIN_AFFILIATIONS: [{ id_affiliation_medecin: "AFM1", id_medecin: "ME1", id_club: "CL1", date_debut: "2026-01-01", id_statut_affiliation: "SAF001" }], OFFICIELS_AFFILIATIONS: [{ id_affiliation_officiel: "AFO1", id_officiel: "OF1", id_type_entite: "STR000", id_entite: "FED1", date_debut: "2026-01-01", id_statut_affiliation: "SAF001" }] },
    TERR: { CLUBS: [{ id_club: "CL1", nom_club: "Club de test" }], ENTENTES: [], LIGUES: [] },
    REF: { TYPES_ACTEURS: ["COACH", "OFFICIEL", "ARBITRE", "MEDECIN"].map((label, i) => ({ id_type_acteur: "TAC00" + (i + 2), nom_type_acteur: label })), CYCLES_LICENCES: [{ id_cycle_licence: "CYC001", nom_cycle_licence: "SPORTIF" }], STATUT_LICENCE: ["ACTIVE", "EXPIREE", "SUSPENDUE", "CLOTUREE", "ANNULEE"].map((label, i) => ({ id_statut_licence: "STL00" + (i + 1), nom_statut_licence: label })), STATUTS_AFFILIATION: [{ id_statut_affiliation: "SAF001", nom_statut_affiliation: "ACTIF" }], TYPES_STRUCTURES: [{ id_type_structure: "STR000", nom_type_structure: "FEDERATION" }], FEDERATION: [{ id_federation: "FED1", nom_officiel: "Fédération de test" }] },
  }
  const sheets = {
    getSheetsDataFrom: async (id, ranges) => Object.fromEntries(ranges.map(range => { const name = range.split("!")[0]; assert.ok(Object.hasOwn(data[id], name), name); return [name, structuredClone(data[id][name])] })),
    getSheetDataFrom: async (id, range) => { assert.equal(id, "LIC"); return structuredClone(data[id][range.split("!")[0]]) },
    formatSheetDateColumns: async (...args) => formats.push(args),
    appendSheetRecord: async (id, sheet, row) => { assert.equal(id, "LIC"); assert.equal(sheet, "ACTEURS_LICENCES"); data.LIC.ACTEURS_LICENCES.push(structuredClone(row)); writes.push(row) },
    updateSheetRecordById: async (id, sheet, key, value, row) => { assert.equal(id, "LIC"); assert.equal(sheet, "ACTEURS_LICENCES"); Object.assign(data[id][sheet].find(item => item[key] === value), row); writes.push(row) },
  }
  const mocks = { "server-only": {}, "@/lib/env": { env: { googleSheets: { licencesSpreadsheetId: "LIC", acteursSpreadsheetId: "ACT", affiliationsSpreadsheetId: "AFF", territorialSpreadsheetId: "TERR", referentielsSpreadsheetId: "REF", clientEmail: "test", privateKey: "test" } } }, "@/lib/google-sheets": sheets, "next/cache": { revalidatePath: value => invalidated.push(value) }, "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } } }
  function load(file) {
    file = path.resolve(file); if (cache.has(file)) return cache.get(file)
    const exports = {}; cache.set(file, exports)
    const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
    const req = name => name in mocks ? mocks[name] : name.startsWith("@/") ? load(path.join(root, name.slice(2) + ".ts")) : name.startsWith(".") ? load(path.resolve(path.dirname(file), name.endsWith(".ts") ? name : name + ".ts")) : require(name)
    vm.runInNewContext(code, { exports, require: req, Request, Response, URL, console, process, Promise, Map, Set }, { filename: file })
    return exports
  }
  const route = load(path.join(root, "app/api/licences/acteurs/route.ts")), service = load(path.join(root, "lib/actor-licence-creation.ts"))
  const call = (method, body) => route[method](new Request("http://localhost/api/licences/acteurs", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }))
  return { data, writes, formats, invalidated, call, page: service.actorLicencePageData }
}
module.exports = { harness }

if (require.main === module) test("routes entourage : création, lecture, erreurs, renouvellement, modification et transitions sans Google réel", async () => {
  const h = harness(), input = { id_type_acteur: "TAC002", id_acteur: "CO1", id_affiliation_acteur: "AF1", id_cycle_licence: "CYC001", numero_licence: "001", date_delivrance: "01/01/2026", date_debut_validite: "01/01/2026", date_fin_validite: "31/12/2026", id_statut_licence: "STL001", observations: "" }
  assert.equal((await h.call("POST", { ...input, id_cycle_licence: "UNKNOWN" })).status, 422)
  assert.equal((await h.call("POST", { ...input, date_delivrance: "31/02/2026" })).status, 422)
  assert.equal(h.writes.length, 0); assert.equal(h.formats.length, 0)
  const response = await h.call("POST", input); assert.equal(response.status, 201)
  const { licence } = await response.json(); assert.equal(licence.date_delivrance, "2026-01-01"); assert.equal(licence.id_affiliation_acteur, "AF1")
  assert.equal((await h.call("POST", input)).status, 409)
  const page = await h.page(); assert.equal(page.rows[0].acteur, "Coach de test"); assert.equal(page.rows[0].affiliation, "Club de test · AF1"); assert.equal(page.references.affiliations[0].dateDebut, "2024-02-01")
  assert.ok(h.invalidated.includes("/licences/entourage")); assert.equal(h.formats[0][3], "yyyy-mm-dd")
  assert.equal((await h.call("PUT", { ...input, id: licence.id_licence, numero_licence: "002" })).status, 200)
  assert.equal((await h.page()).rows[0].numero, "002")
  for (const action of ["suspend", "reactivate", "close", "cancel"]) assert.equal((await h.call("PATCH", { id: licence.id_licence, action })).status, 200)
  assert.equal((await h.call("PATCH", { id: licence.id_licence, action: "reactivate" })).status, 409)
  assert.equal((await h.call("POST", { ...input, date_debut_validite: "01/01/2027", date_fin_validite: "31/12/2027" })).status, 201)
  assert.equal((await h.call("POST", { ...input, id_type_acteur: "TAC004", id_acteur: "AR1", id_affiliation_acteur: "" })).status, 201)
  assert.equal((await h.call("POST", { ...input, id_type_acteur: "TAC003", id_acteur: "OF1", id_affiliation_acteur: "AFO1" })).status, 201)
  assert.equal((await h.call("POST", { ...input, id_type_acteur: "TAC005", id_acteur: "ME1", id_affiliation_acteur: "AFM1" })).status, 201)
  assert.equal((await h.call("PUT", { id: "ABSENT", ...input })).status, 404)
  assert.equal((await h.call("PATCH", {})).status, 422)
})
