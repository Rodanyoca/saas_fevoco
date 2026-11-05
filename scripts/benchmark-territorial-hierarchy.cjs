/* global require, __dirname, process, Buffer, console */
/* eslint-disable @typescript-eslint/no-require-imports -- Local synthetic comparison of committed and working TypeScript. */
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm"), ts = require("typescript")
const { execFileSync } = require("node:child_process")
const assert = require("node:assert/strict")
const { performance } = require("node:perf_hooks")
const root = path.resolve(__dirname, "..")
const reference = process.argv[2] || "HEAD"
const beforeSource = execFileSync("git", ["-c", `safe.directory=${root.replaceAll("\\", "/")}`, "show", `${reference}:lib/territorial-hierarchy.ts`], { cwd: root, encoding: "utf8" })
function load(source) {
  const exports = {}
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports })
  return exports.buildLigueHierarchy
}
const before = load(beforeSource), after = load(fs.readFileSync(path.join(root, "lib/territorial-hierarchy.ts"), "utf8"))
const ligue = { idLigue: "L1" }, ententes = [{ idLigue: "L1", idEntente: "E1" }]
const clubs = Array.from({ length: 100 }, (_, i) => ({ idClub: `C${i}`, idEntente: "E1", idLigue: "L1" }))
const athletes = Array.from({ length: 10000 }, (_, i) => ({ idAthlete: `A${i}`, clubId: i < 8000 ? "C0" : `C${i % 100}` }))
const run = fn => fn(ligue, ententes, clubs, athletes)
const serialize = result => JSON.stringify({ ...result, clubsByEntenteId: Array.from(result.clubsByEntenteId), athletesByClubId: Array.from(result.athletesByClubId) })
assert.equal(serialize(run(before)), serialize(run(after)))
for (let i = 0; i < 3; i++) { run(before); run(after) }
const samples = { before: [], after: [] }
for (let i = 0; i < 8; i++) for (const key of i % 2 ? ["after", "before"] : ["before", "after"]) {
  const cpu = process.cpuUsage(), start = performance.now()
  const result = run(key === "before" ? before : after)
  const elapsedMs = performance.now() - start, used = process.cpuUsage(cpu)
  samples[key].push({ cpuMs: (used.user + used.system) / 1000, elapsedMs, bytes: Buffer.byteLength(serialize(result)) })
}
console.log(JSON.stringify({ reference, synthetic: { ententes: 1, clubs: 100, athletes: 10000 }, equivalent: true, googleCalls: 0, samples }, null, 2))
