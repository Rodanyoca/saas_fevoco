/* eslint-env node */
/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS harness for the actual server modules. */
const test = require("node:test"), assert = require("node:assert/strict")
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm"), ts = require("typescript")

for (const kind of ["coachs", "athletes"]) test(`chargement ${kind} : lectures groupees, cache et fresh`, async () => {
  const root = path.resolve(__dirname, ".."), modules = new Map(), cache = new Map(), calls = []
  const values = range => range.startsWith("ACTEURS_LICENCES!") ? [["id_licence", "id_type_acteur", "id_acteur", "numero_licence", "id_statut_licence"], ["LC1", "TAC002", "CO1", "TEST-CO1", "STL001"], ["LC2", "TAC002", "CO2", "TEST-CO2", "STL003"]] : range.startsWith("STATUT_LICENCE!") ? [["id_statut_licence", "nom_statut_licence"], ["STL001", "ACTIVE"], ["STL003", "SUSPENDUE"]] : range.startsWith("ATHLETE_LICENCES!") ? [["id_licence", "id_athlete", "id_saison", "numero_licence", "id_statut_licence", "id_affiliation_athlete"], ["L1", "A1", "S2026", "TEST-2026", "STL001", "F1"], ["L2", "A2", "S2025", "TEST-2025", "STL001", "F2"]] : range.startsWith("ATHLETE_AFFILIATIONS!") ? [["id_affiliation_athlete", "id_athlete", "id_club"], ["F1", "A1", "C1"], ["F2", "A2", "C2"], ["F3", "A1", "C3"]] : range.startsWith("CLUBS!") ? [["id_club", "nom_club"], ["C1", "Club historique"], ["C2", "Autre club"], ["C3", "Nouveau club"]] : range.startsWith("SAISON!") ? [["id_saison", "date_debut", "date_fin"], ["S2026", "2026-01-01", "2026-12-31"], ["S2025", "2025-01-01", "2025-12-31"]] : range.startsWith("SEXES!") ? [["id_sexe", "nom_sexe"], ["S1", "Masculin"]] : range.startsWith("NIVEAUX_COACH!") ? [["id_niveau_coach", "nom_niveau_coach"], ["N1", "National"]] : [["id"]]
  const mocks = {
    "server-only": {},
    "@/lib/env": { env: { googleSheets: { acteursSpreadsheetId: "ACT", affiliationsSpreadsheetId: "AFF", territorialSpreadsheetId: "TERR", licencesSpreadsheetId: "LIC", referentielsSpreadsheetId: "REF", clientEmail: "test", privateKey: "test" } }, isGoogleSheetsConfigured: () => true },
    "next/cache": { revalidateTag() {}, unstable_cache: (fn, keys) => () => { const key = JSON.stringify(keys); if (!cache.has(key)) cache.set(key, fn()); return cache.get(key) } },
    googleapis: { google: { auth: { JWT: class {} }, sheets: () => ({ spreadsheets: { values: {
      batchGet: async ({ spreadsheetId, ranges }) => { calls.push({ spreadsheetId, ranges }); return { data: { valueRanges: ranges.map(range => ({ values: values(range) })) } } },
      get: async ({ spreadsheetId, range }) => { calls.push({ spreadsheetId, range }); return { data: { values: values(range) } } },
    } } }) } },
  }
  function load(file) {
    file = path.resolve(file); if (modules.has(file)) return modules.get(file)
    const exports = {}; modules.set(file, exports)
    const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
    const req = name => name in mocks ? mocks[name] : name.startsWith("@/") ? load(path.join(root, name.slice(2) + ".ts")) : name.startsWith(".") ? load(path.resolve(path.dirname(file), name.endsWith(".ts") ? name : name + ".ts")) : require(name)
    vm.runInNewContext(code, { exports, require: req, console, process, setTimeout, clearTimeout, setImmediate }, { filename: file })
    return exports
  }
  const { getCoachs, getAthletes } = load(path.join(root, "lib/data.ts")), { getCoachLicences, getAthleteLicences } = load(path.join(root, "lib/actor-records.ts")), { getActorSexes, getCoachLevels } = load(path.join(root, "lib/actor-references.ts"))
  const page = () => kind === "coachs" ? Promise.all([getCoachs(), getCoachLicences(), getActorSexes(), getCoachLevels()]) : Promise.all([getAthletes(), getAthleteLicences(), getActorSexes()])
  const initial = await page()
  if (kind === "coachs") {
    assert.equal(initial[1][0].statutLicence, "ACTIVE", "Display the reference label, not its ID")
    assert.equal(initial[1][0].idStatutLicence, "STL001", "Preserve the stable status ID")
    assert.equal(initial[1][1].statutLicence, "SUSPENDUE")
  }
  if (kind === "athletes") {
    const active = load(path.join(root, "lib/active-actor-licences.ts")).activeActorLicenceNumbers(initial[1], "2026-10-08")
    assert.equal(active.get("A1"), "TEST-2026", "Active seasonal athlete licence must appear in the list")
    assert.equal(initial[1][0].nomClub, "Club historique", "Use the licence affiliation, not the current affiliation")
    assert.equal(initial[1][1].nomClub, "Autre club")
    assert.equal(active.has("A2"), false, "A previous season must not appear as active")
  }
  assert.equal(calls.length, kind === "coachs" ? 3 : 5)
  assert.deepEqual(Array.from(calls.find(call => call.spreadsheetId === "REF").ranges), kind === "coachs" ? ["NIVEAUX_COACH!A:C", "SEXES!A:C", "STATUT_LICENCE!A:ZZ"] : ["SAISON!A:ZZ", "SEXES!A:C"])
  await page(); assert.equal(calls.length, kind === "coachs" ? 3 : 5)
  await load(path.join(root, "lib/google-sheets.ts")).getSheetDataFrom("ACT", kind === "coachs" ? "COACHS!A:ZZ" : "ATHLETES!A:ZZ", { fresh: true })
  assert.equal(calls.length, kind === "coachs" ? 4 : 6); assert.equal(calls.at(-1).range, kind === "coachs" ? "COACHS!A:ZZ" : "ATHLETES!A:ZZ")
})
