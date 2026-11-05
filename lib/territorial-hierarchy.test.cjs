/* global require, __dirname */
/* eslint-disable @typescript-eslint/no-require-imports -- Execute the actual TypeScript model without Next.js. */
const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const ts = require("typescript")
const source = fs.readFileSync(path.join(__dirname, "territorial-hierarchy.ts"), "utf8")
const exportsModel = {}
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: exportsModel })
const { buildLigueHierarchy } = exportsModel

test("club counts preserve duplicate rows and empty club IDs just like filter/length", () => {
  const rows = [{ clubId: "C1" }, { clubId: "C1" }, { clubId: "C2" }, { clubId: "" }]
  const counts = exportsModel.countAthletesByClub(rows)
  for (const id of ["C1", "C2", "", "unknown"]) assert.equal(counts.get(id) ?? 0, rows.filter(row => row.clubId === id).length)
})

test("territorial groups preserve order, deduplication, membership and diagnostics", () => {
  const ententes = [{ idEntente: "E1", idLigue: "L1" }, { idEntente: "E2", idLigue: "L2" }]
  const clubs = [{ idClub: "C1", idEntente: "E1", idLigue: "L1" }, { idClub: "C2", idEntente: "E1", idLigue: "L2" }, { idClub: "C3", idEntente: "E2" }]
  const athletes = [{ idAthlete: "A1", clubId: "C1" }, { idAthlete: "A2", clubId: "C1" }, { idAthlete: "A1", clubId: "C1" }, { idAthlete: "A3", clubId: "C3" }]
  const result = buildLigueHierarchy({ idLigue: "L1" }, ententes, clubs, athletes)
  assert.deepEqual(Array.from(result.clubsByEntenteId.get("E1"), item => item.idClub), ["C1", "C2"])
  assert.deepEqual(Array.from(result.athletesByClubId.get("C1"), item => item.idAthlete), ["A1", "A2"])
  assert.equal(result.diagnostics.length, 1)
  assert.match(result.diagnostics[0], /Club C2/)
  assert.equal(athletes.length, 4, "Input collections remain intact")
})

test("empty or unknown league has no related records", () => {
  const result = buildLigueHierarchy({ idLigue: "unknown" }, [{ idEntente: "E1", idLigue: "L1" }], [], [])
  assert.equal(result.ententes.length, 0)
  assert.equal(result.clubsByEntenteId.size, 0)
  assert.equal(result.athletesByClubId.size, 0)
})
