/* global require, __dirname */
/* eslint-disable @typescript-eslint/no-require-imports -- Exercise the real server page orchestration with synthetic sources. */
const test = require("node:test"), assert = require("node:assert/strict")
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm"), ts = require("typescript")
for (const page of ["ligues", "ententes", "clubs"]) for (const unavailable of [false, true]) test(`${page}: one hierarchy build, source unavailable=${unavailable}`, async () => {
  let calls = 0
  const hierarchy = { ligues: [{ idLigue: "L1" }], ententes: [{ idEntente: "E1" }], clubs: [{ idClub: "C1" }] }
  const data = {
    getTerritorialHierarchy: async () => { calls++; if (unavailable) throw Error("synthetic source failure"); return hierarchy },
    getAthletes: async () => [{ idAthlete: "A1" }], getProvinceOptions: async () => [],
  }
  const exports = {}
  const req = name => name === "@/lib/data" ? data : name === "@/lib/club-actors" ? { loadClubActors: () => { throw Error("Actor data must not be preloaded on the list") } } : name === "@/lib/club-references" ? { getClubCategories: async () => [], getClubSexes: async () => [] } : name === "react/jsx-runtime" ? { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) } : {}
  const source = fs.readFileSync(path.join(__dirname, "..", "app", page, "page.tsx"), "utf8")
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, { exports, require: req })
  const result = await exports.default()
  const props = result.props.children.props
  assert.equal(calls, 1)
  assert.equal(props[page].length, unavailable ? 0 : 1)
  if (page !== "clubs") assert.equal(props.athletes.length, 1, "Independent data remains available after a territorial failure")
  else assert.equal("actorData" in props, false, "Clubs list must not serialize every club's actors")
  assert.equal(page === "ligues" ? props.relationsReady : !props.dataLoadError, !unavailable)
})
