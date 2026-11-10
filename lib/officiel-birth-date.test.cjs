/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports -- Harness for the actual server module. */
const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const vm = require("node:vm")
const ts = require("typescript")

function load(file, mocks = {}) {
  const exports = {}
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  vm.runInNewContext(code, { exports, require: name => {
    if (name in mocks) return mocks[name]
    throw new Error(`Unexpected import: ${name}`)
  }, Date })
  return exports
}

test("official birth dates round-trip through the real OFFICIELS header", async () => {
  const dates = load("lib/compact-date.ts")
  const { mapOfficielRow } = load("lib/mappers/officiels.ts")
  const rows = [{ id_officiel: "OFF00001", nom_complet: "Officiel", id_sexe: "S1", date_de_naissance: "1990-01-01", statut: "ACTIF" }]
  const formats = []
  const write = record => {
    // Match Sheets' header-name projection; unknown keys are not written.
    const projected = { ...record, date_de_naissance: record.date_de_naissance ?? "" }
    delete projected.date_naissance
    return projected
  }
  const api = load("lib/officiel-mutations.ts", {
    "server-only": {},
    "@/lib/compact-date": dates,
    "@/lib/actor-references": { getActorSexes: async () => [{ id: "S1", nom: "Masculin" }] },
    "@/lib/actor-id": { nextActorId: () => "OFF00002" },
    "@/lib/data": { getOfficiels: async () => rows.map(mapOfficielRow) },
    "@/lib/env": { env: { googleSheets: { acteursSpreadsheetId: "test" } } },
    "@/lib/google-sheets": {
      formatSheetDateColumn: async (...args) => formats.push(args),
      appendSheetRecord: async (_book, _sheet, record) => rows.push(write(record)),
      updateSheetRecordById: async (_book, _sheet, _key, id, record) => {
        const index = rows.findIndex(row => row.id_officiel === id)
        rows[index] = { ...rows[index], ...write(record) }
      },
    },
  })
  const created = await api.createOfficiel({ nomComplet: "Officiel", idSexe: "S1", dateNaissance: "29022000" })
  assert.equal(created.dateDeNaissance, "2000-02-29")
  assert.equal(rows[1].date_de_naissance, "2000-02-29")
  const updated = await api.updateOfficiel("OFF00001", { dateNaissance: "27/09/1990" })
  assert.equal(updated.dateDeNaissance, "1990-09-27")
  assert.equal(dates.compactDateFromSheet(updated.dateDeNaissance), "27/09/1990")
  assert.ok(formats.some(args => args[2] === "date_de_naissance" && args[3] === "yyyy-mm-dd"))
  await assert.rejects(api.updateOfficiel("OFF00001", { dateNaissance: "31022000" }))
  await assert.rejects(api.updateOfficiel("OFF00001", { dateNaissance: "01/01/2099" }))
  await api.updateOfficiel("OFF00001", { dateNaissance: "" })
  assert.equal(rows[0].date_de_naissance, "")
})
