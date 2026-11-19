/* eslint-disable @typescript-eslint/no-require-imports -- Run actual eligibility against a strictly read-only Google transport. */
/* global require, process, console, setTimeout, clearTimeout */
const fs = require("node:fs"), path = require("node:path"), vm = require("node:vm"), ts = require("typescript")
const root = process.cwd()
require("@next/env").loadEnvConfig(root, false, { info() {}, error() {} })
const { google } = require("googleapis")
async function main() {
  const auth = new google.auth.JWT({ email: process.env.GOOGLE_CLIENT_EMAIL, key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"), scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"] })
  const client = google.sheets({ version: "v4", auth }), readonly = { spreadsheets: { get: client.spreadsheets.get.bind(client.spreadsheets), values: { batchGet: client.spreadsheets.values.batchGet.bind(client.spreadsheets.values) } } }
  const cache = new Map(), mocks = { "server-only": {}, "@/lib/google-sheets": { sportsSheetsClient: async () => readonly } }
  function load(file) {
    file = path.resolve(root, file); if (cache.has(file)) return cache.get(file)
    const exports = {}; cache.set(file, exports)
    const code = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
    const req = name => name in mocks ? mocks[name] : name.startsWith("@/") ? load(name.slice(2) + ".ts") : name.startsWith(".") ? load(path.resolve(path.dirname(file), name.endsWith(".ts") ? name : name + ".ts")) : require(name)
    vm.runInNewContext(code, { exports, require: req, process, console, setTimeout, clearTimeout }, { filename: file }); return exports
  }
  const { athleteLicenceCandidates } = load("lib/athlete-licence-creation.ts"), { sportsToday } = load("lib/sports-model.ts")
  const result = await athleteLicenceCandidates({ clubId: "2705102", seasonId: "SAI006", date: sportsToday() })
  console.log(JSON.stringify({ checkedAt: new Date().toISOString(), writes: 0, results: ["ATH00584", "ATH00586"].map(athleteId => ({ athleteId, eligible: result.candidates.some(row => row.athleteId === athleteId), reasons: result.conflicts.filter(row => row.athleteId === athleteId).map(row => row.code) })) }, null, 2))
}
main().catch(error => { console.error(JSON.stringify({ error: "Vérification indisponible", code: error.code, status: error.status || error.response?.status })); process.exitCode = 1 })
