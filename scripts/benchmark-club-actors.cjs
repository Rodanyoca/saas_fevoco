/* global require, __dirname, process, Buffer, console */
/* eslint-disable @typescript-eslint/no-require-imports -- Synthetic benchmark of actual TypeScript models. */
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm"), ts = require("typescript")
const { execFileSync } = require("node:child_process")
const assert = require("node:assert/strict")
const { performance } = require("node:perf_hooks")
const root = path.resolve(__dirname, ".."), reference = process.argv[2] || "HEAD"
function load(source) {
  const exports = {}
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports })
  return exports
}
const before = load(execFileSync("git", ["-c", `safe.directory=${root.replaceAll("\\", "/")}`, "show", `${reference}:lib/club-actors-model.ts`], { cwd: root, encoding: "utf8" })).buildClubActorIndex
const after = load(fs.readFileSync(path.join(root, "lib/club-actors-model.ts"), "utf8")).buildClubActorIndex
const canonicalDate = load(fs.readFileSync(path.join(root, "lib/compact-date.ts"), "utf8")).formatDateFromSheet
const actors = Array.from({ length: 1000 }, (_, i) => ({ id_athlete: `A${i}`, nom_complet: `Synthetic ${String(i).padStart(5, "0")}`, statut: "ACTIF", id_sexe: "S1" }))
const affiliations = actors.flatMap((actor, i) => [0, 1].map(() => ({ id_athlete: actor.id_athlete, id_club: i < 800 ? "C0" : `C${i % 20}`, id_statut_affiliation: "ACTIVE", date_debut: "2026-01-01", date_fin: "2026-12-31" })))
const sources = { actors: { ATHLETES: actors }, affiliations: { ATHLETE_AFFILIATIONS: affiliations }, references: { SEXES: [{ id_sexe: "S1", nom_sexe: "Masculin" }], STATUTS_AFFILIATION: [{ id_statut_affiliation: "ACTIVE", nom_statut_affiliation: "ACTIF" }] } }
function run(key) {
  let dateConversions = 0
  const convert = value => { dateConversions++; return canonicalDate(value) }
  const result = (key === "before" ? before : after)(sources, "2026-11-05", convert, key === "scoped" ? "C1" : undefined)
  return { result, dateConversions }
}
const old = run("before"), current = run("after"), scoped = run("scoped")
assert.equal(JSON.stringify(old.result), JSON.stringify(current.result), "Global output must be exactly equivalent")
assert.equal(JSON.stringify(scoped.result.byClub.C1), JSON.stringify(old.result.byClub.C1), "Scoped C1 output must match the baseline C1")
for (let i = 0; i < 3; i++) for (const key of ["before", "after", "scoped"]) run(key)
const samples = { before: [], after: [], scoped: [] }
for (let i = 0; i < 8; i++) for (const key of i % 2 ? ["scoped", "after", "before"] : ["before", "after", "scoped"]) {
  const cpu = process.cpuUsage(), start = performance.now(), output = run(key)
  const elapsedMs = performance.now() - start, used = process.cpuUsage(cpu)
  samples[key].push({ cpuMs: (used.user + used.system) / 1000, elapsedMs, dateConversions: output.dateConversions, bytes: Buffer.byteLength(JSON.stringify(output.result)), actorsReturned: Object.values(output.result.byClub).reduce((sum, group) => sum + group.athletes.length, 0) })
}
console.log(JSON.stringify({ reference, globalEquivalent: true, scopedEquivalent: true, googleCalls: 0, synthetic: { identities: actors.length, affiliations: affiliations.length, clubs: 20 }, samples }, null, 2))
