/* global require, __dirname, console, process */
/* eslint-disable @typescript-eslint/no-require-imports -- Exercise real server modules with synthetic Sheets sources. */
const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm"), ts = require("typescript")

function harness({ licenceFailure = false, configured = true } = {}) {
  const root = path.resolve(__dirname, ".."), modules = new Map(), calls = []
  const sources = {
    ACT: { ATHLETES: ["A1", "A2", "A3", "A4"].map(id => ({ id_athlete: id, nom_complet: id })), COACHS: [{ id_coach: "CO1", nom_complet: "Coach test" }] },
    AFF: { ATHLETE_AFFILIATIONS: ["A1", "A2", "A3", "A4"].map(id => ({ id_athlete: id, id_club: id === "A4" ? "C2" : "C1", statut_affiliation: "ACTIF" })), COACH_AFFILIATIONS: [{ id_coach: "CO1", id_club: "C1", statut_affiliation: "ACTIF" }] },
    REF: { SAISON: [{ id_saison: "S1", date_debut: "2020-01-01", date_fin: "2099-12-31" }, { id_saison: "OLD", date_debut: "2000-01-01", date_fin: "2001-12-31" }] },
    LIC: {
      ATHLETE_LICENCES: [
        { id_licence: "L1", id_athlete: "A1", id_saison: "S1", numero_licence: "LIC-TEST", id_statut_licence: "STL001" },
        { id_licence: "L2", id_athlete: "A2", id_saison: "S1", numero_licence: "SUSPENDUE", id_statut_licence: "STL003" },
        { id_licence: "L3", id_athlete: "A3", id_saison: "OLD", numero_licence: "EXPIREE", id_statut_licence: "STL001" },
      ],
      ACTEURS_LICENCES: [{ id_licence: "LC1", id_acteur: "CO1", id_type_acteur: "TAC002", numero_licence: "COACH-TEST", id_statut_licence: "STL001", date_debut_validite: "2020-01-01", date_fin_validite: "2099-12-31" }],
    },
  }
  const mocks = {
    "server-only": {},
    "@/lib/env": { env: { googleSheets: { acteursSpreadsheetId: "ACT", affiliationsSpreadsheetId: "AFF", referentielsSpreadsheetId: "REF", licencesSpreadsheetId: configured ? "LIC" : "", clientEmail: "test", privateKey: "test" } } },
    "@/lib/google-sheets": { getSheetsDataFrom: async (book, ranges) => {
      calls.push({ book, ranges })
      if (book === "LIC" && licenceFailure) throw new Error("Source indisponible")
      return Object.fromEntries(ranges.map(range => { const sheet = range.split("!")[0]; return [sheet, sources[book]?.[sheet] || []] }))
    } },
  }
  function load(file) {
    file = path.resolve(file)
    if (modules.has(file)) return modules.get(file)
    const exports = {}; modules.set(file, exports)
    const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
    const req = name => name in mocks ? mocks[name] : name.startsWith("@/") ? load(path.join(root, name.slice(2) + ".ts")) : name.startsWith(".") ? load(path.resolve(path.dirname(file), name.endsWith(".ts") ? name : name + ".ts")) : require(name)
    vm.runInNewContext(code, { exports, require: req, console, process, Date }, { filename: file })
    return exports
  }
  return { load: () => load(path.join(root, "lib/club-actors.ts")).loadClubActors("C1"), calls }
}

test("fiche club : licences actives athlètes et coachs, sans suspension ni ancienne saison", async () => {
  const { load, calls } = harness()
  const result = await load()
  assert.deepEqual(Object.keys(result.byClub), ["C1"])
  assert.equal(result.byClub.C1.athletes[0].numeroLicence, "LIC-TEST")
  assert.equal(result.byClub.C1.athletes[1].numeroLicence, "")
  assert.equal(result.byClub.C1.athletes[2].numeroLicence, "")
  assert.equal(result.byClub.C1.coachs[0].numeroLicence, "COACH-TEST")
  assert.equal(calls.filter(call => call.book === "LIC").length, 1, "Un lot licences, jamais une lecture par personne")
})

for (const options of [{ licenceFailure: true }, { configured: false }]) test(`licences indisponibles : préserver les acteurs (${JSON.stringify(options)})`, async () => {
  const result = await harness(options).load()
  assert.equal(result.available, true)
  assert.equal(result.byClub.C1.athletes[0].licenceUnavailable, true)
})
